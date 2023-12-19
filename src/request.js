var utils = require("./utils.js");

const defaultDomain = "https://generativelanguage.googleapis.com";

const streamRequest = async (contents, { domain, model, api_key, query, onCompletion }) => {
  let resultText = "";
  return $http.streamRequest({
    method: "POST",
    url: `${domain}/v1/models/${model}:streamGenerateContent?key=${api_key}&alt=sse`,
    header: {
      "Content-Type": "application/json",
    },
    body: {
      generationConfig: {},
      safetySettings: [],
      contents,
    },
    streamHandler: (stream) => {
      let streamText = stream.text;
      const reg = /^data:/;
      if (!reg.test(streamText)) {
        throw new Error("response data invalid");
      }
      streamText = streamText.replace(reg, "");
      const resultJson = JSON.parse(streamText);
      resultText += resultJson?.candidates?.[0]?.content?.parts?.[0].text;
      query.onStream({
        result: { toParagraphs: [resultText] },
      });
    },
    handler: (result) => {
      if (result.response.statusCode >= 400) {
        utils.handleError(onCompletion, result);
      } else {
        onCompletion({
          result: { toParagraphs: [resultText] },
        });
      }
    },
  });
};

const normalRequest = async (contents, { domain, model, api_key, onCompletion }) => {
  $http.request({
    method: "POST",
    url: `${domain}/v1/models/${model}:generateContent?key=${api_key}`,
    header: {
      "Content-Type": "application/json",
    },
    body: {
      generationConfig: {},
      safetySettings: [],
      contents,
    },
    handler: (result) => {
      if (result.response.statusCode >= 400) {
        utils.handleError(onCompletion, result);
      } else {
        const resultText = result.data?.candidates?.[0]?.content?.parts?.[0].text;
        onCompletion({
          result: {
            toParagraphs: [resultText],
          },
        });
      }
    },
  });
};

exports.streamRequest = streamRequest;
exports.normalRequest = normalRequest;
exports.defaultDomain = defaultDomain;
