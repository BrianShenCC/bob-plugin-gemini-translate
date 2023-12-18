var utils = require("./utils.js");

const streamRequest = (prompt, { model, api_key, query }) => {
  let resultText = "";
  $http.streamRequest({
    method: "POST",
    url: `https://generativelanguage.googleapis.com/v1/models/${model}:streamGenerateContent?key=${api_key}&alt=sse`,
    header: {
      "Content-Type": "application/json",
    },
    body: {
      generationConfig: {},
      safetySettings: [],
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
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
        utils.handleError(query, result);
      } else {
        query.onCompletion({
          result: { toParagraphs: [resultText] },
        });
      }
    },
  });
};

const normalRequest = (prompt, { model, api_key, query }) => {
  $http.request({
    method: "POST",
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${api_key}`,
    header: {
      "Content-Type": "application/json",
    },
    body: {
      generationConfig: {},
      safetySettings: [],
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    },
    handler: (result) => {
      if (result.response.statusCode >= 400) {
        utils.handleError(query, result);
      } else {
        const resultText = result.data?.candidates?.[0]?.content?.parts?.[0].text;
        query.onCompletion({
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
