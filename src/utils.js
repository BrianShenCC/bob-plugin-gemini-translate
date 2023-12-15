function handleError(query, result) {
  const { statusCode } = result.response;
  const reason = statusCode >= 400 && statusCode < 500 ? "param" : "api";
  query.onCompletion({
    error: {
      type: reason,
      message: `接口响应错误 - ${statusCode}`,
      addtion: `${JSON.stringify(result)}`,
    },
  });
}

exports.handleError = handleError;
