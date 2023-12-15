const supportedLanguages = [
  ["auto", "auto"],
  ["de", "DE"],
  ["en", "EN"],
  ["es", "ES"],
  ["fr", "FR"],
  ["it", "IT"],
  ["ja", "JA"],
  ["ko", "KO"],
  ["nl", "NL"],
  ["pl", "PL"],
  ["pt", "PT"],
  ["ru", "RU"],
  ["zh-Hans", "ZH"],
  ["zh-Hant", "ZH"],
  ["bg", "BG"],
  ["cs", "CS"],
  ["da", "DA"],
  ["el", "EL"],
  ["et", "ET"],
  ["fi", "FI"],
  ["hu", "HU"],
  ["lt", "LT"],
  ["lv", "LV"],
  ["ro", "RO"],
  ["sk", "SK"],
  ["sl", "SL"],
  ["sv", "SV"],
];

const langMap = new Map(supportedLanguages);
const langMapReverse = new Map(supportedLanguages.map(([standardLang, lang]) => [lang, standardLang]));

exports.langMap = langMap;
exports.langMapReverse = langMapReverse;
