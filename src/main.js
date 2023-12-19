var language = require("./language.js");
var { streamRequest, normalRequest, defaultDomain } = require("./request.js");
var { context } = require("./chart.js");

function supportLanguages() {
  return [...language.langMap.keys()];
}

function translatePrompt(origin_text, { source_lang, target_lang }) {
  // Gemini seems poorly RLHFed.So I currently disable these complex prompt.

  // return `
  // 请将以下${source_lang}内容翻译成${target_lang}：\n${origin_text}
  // 如果 ${origin_text} 是汉语拼音,请将其翻译成${target_lang}.
  // 如果 ${source_lang}和 ${target_lang}一样，则回答"请检查你的翻译语言设置".
  // `;

  return `请将以下${source_lang}内容翻译成${target_lang}：\n${origin_text}`;
}

function polishPrompt(origin_text, { source_lang }) {
  if (source_lang === "ZH") return `请润色以下内容：\n${origin_text}`;
  return `Revise the following sentences to make them more clear, concise, and coherent. \n${origin_text}`;
}

function generatePrompts(text, mode, query) {
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
    return polishPrompt(text, { source_lang });
  } else if (mode === "translate") {
    return translatePrompt(text, { source_lang, target_lang });
  } else {
    throw new Error("未知模式");
  }
}

function getConversation(text, mode, detectFrom, detectTo) {
  // replace gpt&openAi with "*" to avoid gemini return "undefined".
  const origin_text = text.replace(/gpt|openai/gi, "*");
  if (mode === "polish" || mode === "translate") {
    const prompt = generatePrompts(origin_text, mode, {
      detectFrom,
      detectTo,
    });

    return [{ role: "user", parts: [{ text: prompt }] }];
  } else if (mode === "chat") {
    if (origin_text.trim() === "#clear") {
      context.clear();
      return [];
    }
    const data = { role: "user", parts: [{ text: origin_text }] };
    context.get().push(data);
    return context.get();
  } else {
    throw new Error("未知模式");
  }
}

function translate(query, completion) {
  (async () => {
    const origin_text = query.text || "";
    const { custom_domain: domain = defaultDomain, request_mode, model, mode, api_key = "" } = $option;
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
    const contents = getConversation(origin_text, mode, query.detectFrom, query.detectTo);
    if (contents.length === 0) {
      onCompletion({ result: { toParagraphs: ["对话已清空"] } });
      return;
    }
    const setConversation = function (result) {
      if (mode === "chat" && result.result) {
        const returnText = result.result.toParagraphs[0];
        context.get().push({
          role: "model",
          parts: [{ text: returnText }],
        });
      }
    };

    if (request_mode === "stream") {
      streamRequest(contents, {
        domain,
        model,
        api_key,
        query,
        onCompletion: function (result) {
          onCompletion(result);
          setConversation(result);
        },
      });
    } else {
      normalRequest(contents, {
        domain,
        model,
        api_key,
        query,
        onCompletion: function (result) {
          onCompletion(result);
          setConversation(result);
        },
      });
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
