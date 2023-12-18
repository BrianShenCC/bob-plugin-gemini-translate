var HttpErrorCodes = {
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Too Early",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "请求过于频繁，请慢一点。Gemini 对您在 API 上的请求实施速率限制。这些限制适用于每分钟 tokens 数、每分钟请求数（某些情况下是每天请求数）。当前每分钟请求60次以下免费，访问 https://ai.google.dev/pricing 了解更多信息。",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "510": "Not Extended",
  "511": "Network Authentication Required"
};

function handleError(completion, result) {
  if (result?.data?.error?.message) {
    completion({
      error: {
        type: "param",
        message: result?.data?.error?.message,
        addtion: `${JSON.stringify(result?.data)}`,
      },
    });
    return;
  }
  const { statusCode } = result.response;
  const reason = statusCode >= 400 && statusCode < 500 ? "param" : "api";
  completion({
    error: {
      type: reason,
      message: `接口响应错误 - ${HttpErrorCodes[statusCode]}`,
      addtion: `${JSON.stringify(result)}`,
    },
  });
}

exports.handleError = handleError;
