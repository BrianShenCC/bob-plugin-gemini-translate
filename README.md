<div>
  <h1 align="center">Gemini Translator Bob Plugin</h1>
</div>

## 简介

基于 [Gemini API](https://ai.google.dev/docs/gemini_api_overview) 实现的 [Bob](https://bobtranslate.com/) 插件，支持润色，翻译和对话。
Gemini的对话功能似乎经过测试好像要比GPT差。
可以使用 [bard-proxy](https://github.com/vfasky/bard-proxy)，在vercel或者cloudfare上自建代理，配合自定义域名，来实现国内直接访问

### 语言模型

* `gemini-pro` (默认使用): gemini-pro 模型

## 使用方法

1. 安装 [Bob](https://bobtranslate.com/guide/#%E5%AE%89%E8%A3%85) (版本 >= 0.50)，一款 macOS 平台的翻译和 OCR 软件

2. 下载此插件: [bob-plugin-gemini-translate.bobplugin](https://github.com/BrianShenCC/bob-plugin-gemini-translate/releases/latest)

3. 安装此插件

4. 去 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取你的 API KEY

5. 把 API KEY 填入 Bob 偏好设置 > 服务 > 此插件配置界面的 API KEY 的输入框中

## 注意

当使用对话模式时，由于gemini本身的对话处理并不是特别好，只能接受一来一回的对话，如果上一轮对话还没有完全返回就发起新对话，接口会报错，这时需要使用#clear清空对话。

## 感谢

本仓库是在部分代码参考了优秀的bob插件 [bob-plugin-akl-chatgpt-free-translate](https://github.com/akl7777777/bob-plugin-akl-chatgpt-free-translate) 源码。感谢原作者的卓越贡献。

