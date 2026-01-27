<!-- Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) -->

# 暢頡
### [English Version](README.md)

## 目錄
1. [說明](#說明)
2. [使用方式](#使用方式)
3. [版權](#版權)
4. [測試/開發](#測試開發)

## 說明
暢頡是一個倉頡練習軟體

## 使用方式

## 版權

## 測試/開發
因為此專案需利用外部資源，故無法直接在瀏覽器裡打開[`index.html`](./src/index.html)進行測試或開發，若是要的話須使用像是[`http-server`](https://www.npmjs.com/package/http-server/)或類似的軟體。在本專案的最上層資料夾以[`http-server`](https://www.npmjs.com/package/http-server/)進行測試的話，要跑：

```
npx http-server src
```

即可。這麼做就能在[`localhost:8080`](http://localhost:8080)上測試和開發，若`8080`埠無法使用則自己在命令裡加入`-p`和一個數字。

> [!NOTE]
> 要利用[`http-server`](https://www.npmjs.com/package/http-server/)需要先安裝`npm`。

> [!TIP]
> [`http-server`](https://www.npmjs.com/package/http-server/)不是唯一能用來測試之工具。