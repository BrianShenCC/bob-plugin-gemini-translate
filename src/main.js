var language = require("./language.js");
var { streamRequest, normalRequest } = require("./request.js");

function supportLanguages() {
  return [...language.langMap.keys()];
}

function translatePrompt({ source_lang, target_lang, origin_text }) {
  // Gemini seems poorly RLHFed.So I currently disable these complex prompt.

  // return `
  // 请将以下${source_lang}内容翻译成${target_lang}：\n${origin_text}
  // 如果 ${origin_text} 是汉语拼音,请将其翻译成${target_lang}.
  // 如果 ${source_lang}和 ${target_lang}一样，则回答"请检查你的翻译语言设置".
  // `;

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
    const { request_mode, model, mode, api_key = "" } = $option;
    const onCompletion = request_mode === "stream" ? query.onCompletion : completion;
    if (!api_key) {
      onCompletion({
        error: {
          type: "param",
          message: "未输入api_key",
        },
      });
      return;
    }
    if (origin_text?.trim() === "") return;

    const prompt = generatePrompts(
      {
        detectFrom: query.detectFrom,
        detectTo: query.detectTo,
        text: origin_text,
      },
      mode
    );
    if (request_mode === "stream") {
      streamRequest(prompt, { model, api_key, query });
    } else {
      normalRequest(prompt, { model, api_key, query, completion });
    }
  })().catch((err) => {
    onCompletion({
      error: {
        type: err._type || "unknown",
        message: err._message || "未知错误",
        addtion: err._addtion,
      },
    });
  });
}
