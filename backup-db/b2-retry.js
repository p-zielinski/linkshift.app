/**
 * Wraps a B2 operation with retry logic for transient failures
 * @template T
 * @param {() => Promise<T>} operation - The async operation to retry
 * @param {Object} [options] - Retry options
 * @param {number} [options.maxRetries=5] - Maximum number of retry attempts
 * @param {number} [options.initialDelayMs=1000] - Initial delay in milliseconds before first retry
 * @param {number} [options.maxDelayMs=30000] - Maximum delay between retries in milliseconds (default: 30s)
 * @returns {Promise<T>} - Result of the operation
 */
async function withB2Retry(operation, options = {}) {
  const {
    maxRetries = 5,
    initialDelayMs = 1000,
    maxDelayMs = 30000, // 30 seconds max delay
  } = options;

  let retryCount = 0;
  let lastError;

  while (retryCount <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Only retry on 500/503 errors or network errors
      const status = error.status || (error.response && error.response.status);
      const isNetworkError = !status && error.code === "ECONNRESET";
      const shouldRetry = status === 500 || status === 503 || isNetworkError;

      if (!shouldRetry || retryCount >= maxRetries) {
        throw error;
      }

      // Calculate exponential backoff with jitter
      const jitter = 0.75 + Math.random() * 0.5; // 0.75-1.25
      const delayMs = Math.min(initialDelayMs * Math.pow(2, retryCount) * jitter, maxDelayMs);

      console.warn(
        `B2 API attempt ${retryCount + 1}/${maxRetries} failed${status ? ` with status ${status}` : ""}. ` +
          `Retrying in ${Math.round(delayMs)}ms...`,
        error.message,
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
      retryCount++;
    }
  }

  // This should theoretically never be reached due to the while loop conditions
  throw lastError || new Error("B2 operation failed after maximum retries");
}

module.exports = withB2Retry;
