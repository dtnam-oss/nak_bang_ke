/**
 * ERROR_HANDLER.GS
 * Xử lý lỗi tập trung cho toàn bộ ứng dụng
 * Logging và formatting error messages
 */

var ErrorHandler = {

  /**
   * Log lỗi vào Stackdriver Logging
   * @param {string} message - Thông điệp lỗi
   * @param {Error} error - Object lỗi
   * @param {Object} context - Ngữ cảnh bổ sung
   */
  log: function(message, error, context) {
    if (!CONFIG.FEATURES.ENABLE_LOGGING) return;

    var logEntry = {
      timestamp: new Date().toISOString(),
      message: message,
      error: error ? error.toString() : null,
      stack: error ? error.stack : null,
      context: context || {}
    };

    Logger.log(JSON.stringify(logEntry, null, 2));
    console.error(logEntry);
  },

  /**
   * Tạo response lỗi chuẩn hóa
   * @param {string} message - Thông điệp lỗi
   * @param {Error} error - Object lỗi gốc
   * @return {Object} Error response object
   */
  createErrorResponse: function(message, error) {
    return {
      success: false,
      error: true,
      message: message,
      details: error ? error.toString() : null,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Wrap function với error handling
   * @param {Function} fn - Function cần wrap
   * @param {string} functionName - Tên function để logging
   * @return {Function} Wrapped function
   */
  wrapFunction: function(fn, functionName) {
    return function() {
      try {
        return fn.apply(this, arguments);
      } catch (error) {
        ErrorHandler.log(
          'Error in ' + functionName,
          error,
          { arguments: Array.prototype.slice.call(arguments) }
        );
        throw error;
      }
    };
  }
};
