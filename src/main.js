var language = require("./language.js");
var utils = require("./utils.js");

function supportLanguages() {
  return [...language.langMap.keys()];
}

function translatePrompt({ source_lang, target_lang, origin_text }) {
  return `请将以下${source_lang}内容翻译成${target_lang}：\n${origin_text}`;
}

function polishPrompt({ source_lang, origin_text }) {
  if (source_lang === "ZH") return `请润色以下内容：\n${origin_text}`;
  return `Revise the following sentences to make them more clear, concise, and coherent. \n${origin_text}`;
}

function generatePrompts(query, mode) {
  const detectTo = language.langMap.get(query.detectTo);
  const detectFrom = language.langMap.get(query.detectFrom);
  if (!detectTo) {
    const err = new Error();
    Object.assign(err, {
      _type: "unsupportLanguage",
      _message: "Not Support Language",
    });
    throw err;
  }
  const source_lang = detectFrom || "ZH";
  const target_lang = detectTo || "EN";

  if (mode === "polish" || source_lang === target_lang) {
    return polishPrompt({ source_lang, origin_text: query.text });
  } else if (mode === "translate") {
    return translatePrompt({ source_lang, target_lang, origin_text: query.text });
  } else {
    throw new Error("未知模式");
  }
}

function translate(query, completion) {
  (async () => {
    const origin_text = query.text || "";
    const apikey = $option.api_key || "";
    if (!apikey) {
      completion({
        error: {
          type: "param",
          message: "未输入api_key",
        },
      });
      return;
    }
    if (origin_text?.trim() === "") return;

    const prompt = generatePrompts({
      detectFrom: query.detectFrom,
      detectTo: query.detectTo,
      text: origin_text,
    }, $option.mode);
    const model = $option.model;

    $http.request({
      method: "POST",
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apikey}`,
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
  })().catch((err) => {
    completion({
      error: {
        type: err._type || "unknown",
        message: err._message || "未知错误",
        addtion: err._addtion,
      },
    });
  });
}
