// importing required modules
const { execute } = require("@getvim/execute");
const compress = require("gzipme");
const fs = require("fs");
const path = require("path");
const B2 = require("backblaze-b2");
const crypto = require("crypto");
const SplitFile = require("split-file");
const withB2Retry = require("./b2-retry");
const schedule = require("node-schedule");
const loadClientEnvWithSecrets = require("./load-client-env-with-secrets");

require("dotenv").config();
loadClientEnvWithSecrets();

// B2 client configuration
const b2Config = {
  applicationKeyId: process.env.BACKBLAZE_APPLICATION_KEY_ID,
  applicationKey: process.env.BACKBLAZE_APPLICATION_KEY,
  retry: { retries: 0 },
};

// Initialize B2 client
const b2 = new B2(b2Config);

// getting db connection parameters from environment file
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DATABASE;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;

const b2ApplicationKeyId = process.env.BACKBLAZE_APPLICATION_KEY_ID;
const b2ApplicationKey = process.env.BACKBLAZE_APPLICATION_KEY;

const HOST_ID = process.env.HOST_ID;

const PART_SIZE_FOR_LARGE_FILES = 5500000;
const LARGE_FILE_MINIMUM_SIZE = PART_SIZE_FOR_LARGE_FILES + 500000;

const getBucketId = async () => {
  const bucketName = `${HOST_ID}-db-backup`;

  const getOrCreateBucket = async () => {
    try {
      const { data: getBucketData } = await b2.getBucket({ bucketName });

      if (getBucketData.buckets.length > 1) {
        throw new Error("More than one bucket with the same name");
      }
      if (getBucketData.buckets.length === 1) {
        return getBucketData.buckets[0].bucketId;
      }

      const { data: createBucketData } = await b2.createBucket({
        bucketName,
        bucketType: "allPrivate",
      });
      return createBucketData.bucketId;
    } catch (error) {
      console.error("Error in getOrCreateBucket:", error.message);
      throw error;
    }
  };

  return withB2Retry(getOrCreateBucket, {
    maxRetries: 5,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
  });
};

const calculateFileSha1 = async (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha1");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
};

const uploadFile = async (filePath, fileName, fileSize) => {
  if (!fileSize) {
    throw new Error("File size was not provided");
  }
  if (fileSize > LARGE_FILE_MINIMUM_SIZE) {
    throw new Error("File size is too large, call uploadLargeFile method instead");
  }

  await withB2Retry(
    async () => {
      await b2.authorize();
      const bucketId = await getBucketId();

      const { data: getUploadUrlResult } = await b2.getUploadUrl({ bucketId });
      console.log("Got small file upload url");

      const fileBuffer = fs.readFileSync(filePath);
      const sha1 = await calculateFileSha1(filePath);

      const { data: uploadFileResult } = await b2.uploadFile({
        uploadUrl: getUploadUrlResult.uploadUrl,
        uploadAuthToken: getUploadUrlResult.authorizationToken,
        fileName,
        data: fileBuffer,
        hash: sha1,
        mime: "application/gzip",
      });

      console.log(`File ${fileName} was uploaded`);
      return uploadFileResult;
    },
    {
      maxRetries: 5,
      initialDelayMs: 2000,
      maxDelayMs: 30000,
    },
  );

  fs.unlinkSync(filePath);
};

const uploadLargeFile = async (filePath, fileName, fileSize) => {
  if (!fileSize) {
    throw new Error("File size was not provided");
  }
  if (fileSize < LARGE_FILE_MINIMUM_SIZE) {
    throw new Error("File size is too small, call uploadFile method instead");
  }

  const filePathsToUpload = await SplitFile.splitFileBySize(filePath, PART_SIZE_FOR_LARGE_FILES);
  let b2FileId;

  const b2 = new B2({
    applicationKeyId: b2ApplicationKeyId,
    applicationKey: b2ApplicationKey,
    retry: {
      retries: 10,
    },
  });
  await b2.authorize();

  const { data: startLargeFileResult } = await b2.startLargeFile({
    bucketId: await getBucketId(b2),
    fileName,
  });
  console.log("Started large file upload");
  b2FileId = startLargeFileResult.fileId;

  try {
    const { data: getUploadPartUrlResult } = await b2.getUploadPartUrl({
      fileId: b2FileId,
    });
    console.log("Got upload part url");

    const partSha1Array = [];
    for (const [index, filePath] of filePathsToUpload.entries()) {
      const fileBuffer = fs.readFileSync(filePath);
      partSha1Array.push(await calculateFileSha1(filePath));
      await b2.uploadPart({
        partNumber: index + 1,
        uploadUrl: getUploadPartUrlResult.uploadUrl,
        uploadAuthToken: getUploadPartUrlResult.authorizationToken,
        data: fileBuffer,
      });
      console.log(`Uploaded part ${index + 1}/${filePathsToUpload.length}`);
    }
    const { data: finishLargeFileResult } = await b2.finishLargeFile({
      fileId: b2FileId,
      partSha1Array,
    });
    console.log("Finished large file upload:");
    console.log(finishLargeFileResult);
  } catch (error) {
    console.log(error);
    if (b2FileId) {
      await b2.cancelLargeFile({ fileId: b2FileId });
      console.log("Cancelled large file upload");
    } else {
      console.log("Unknown error, large file upload probably did not start at all");
    }
  }

  for (const filePath of filePathsToUpload) {
    fs.unlinkSync(filePath);
  }
};

const takePGBackup = async () => {
  const date = new Date();
  const today = `${date.toISOString()}`;
  const backupFile = `${database}-database-backup-${today}.tar`;
  await execute(
    `pg_dump -U ${username} -h ${dbHost} -p ${dbPort} -f ${backupFile} -F t -d ${database}`,
    {
      env: { PGPASSWORD: password },
    },
  );
  await compress(backupFile);
  fs.unlinkSync(backupFile);
  console.log("Zipped backup created");
  const compressedBackupFile = `${backupFile}.gz`;
  const filePath = path.join(__dirname, compressedBackupFile);
  const fileExist = fs.existsSync(filePath);
  if (fileExist) {
    const sourceFileStats = fs.statSync(filePath);
    if (sourceFileStats.size > LARGE_FILE_MINIMUM_SIZE) {
      await uploadLargeFile(filePath, compressedBackupFile, sourceFileStats.size);
    } else {
      await uploadFile(filePath, compressedBackupFile, sourceFileStats.size);
    }
  } else {
    console.log("Zipped backup could not be found.");
  }
};

const job = schedule.scheduleJob("*/5 * * * *", async () => {
  try {
    await takePGBackup();
  } catch (e) {
    console.log("Backup failed");
    console.error(e);
  }
});

if (job) {
  console.log("Take backup job scheduled");
}
