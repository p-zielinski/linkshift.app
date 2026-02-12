const fs = require("fs");

const loadClientEnvWithSecrets = () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("NOT LOADING SECRETS OUT OF FILES");
    return;
  }

  console.log("LOADING SECRETS OUT OF FILES");
  for (const key in process.env) {
    if (key.endsWith("_FILE")) {
      const actualKey = key.replace("_FILE", "");
      const filePath = process.env[key];
      if (filePath && fs.existsSync(filePath)) {
        const value = fs.readFileSync(filePath, "utf8").trim();
        console.log(`${key}: ${"*".repeat(value.split("").length)}`);
        process.env[actualKey] = value;
      } else {
        console.log("ERROR: No file found for file " + filePath);
      }
    }
  }
};

module.exports = loadClientEnvWithSecrets;
