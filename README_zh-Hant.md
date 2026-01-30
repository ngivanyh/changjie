<!-- Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) -->

# 暢頡
### [English Version](README.md)

## 目錄
1. [說明](#說明)
2. [使用方式](#使用方式)
3. [版權](#版權)
4. [測試/開發](#測試開發)

## 說明
倉頡是一個輸入字根的輸入法，這些字根表示的是繁體中文字的筆畫的一部分。而此網站「暢頡」是一個倉頡練習軟體，以簡潔為其設計理念，卻依舊能提供一個全面性的倉頡學習或練習的體驗。資料全部存去在使用者端中，且無外部附加模組；簡單和淺顯易懂的介面；彈性的程式碼，讓之後擴充方便。

此專案原本由[`Cycatz/cangzen`](https://github.com/Cycatz/cangzen)而來，為其之延伸，以下為增加的功能：
- 較完整的鍵盤，使對照鍵位更加輕鬆
- 鍵盤的顯示開關，以練習不看鍵盤打字
- 轉場效果
- 在能練習更多的字的情況下（≒ 3萬字），類似或提升的網頁速度
- 更多介面樣式 （淺色、深色、森林、海洋、蘋果、冰雪）

## 操作方式

## 版權聲明

## 測試/開發
因為此專案需利用外部資源，故無法直接在瀏覽器裡打開[`index.html`](./src/index.html)進行測試或開發，若是要的話須使用像是[`http-server`](https://www.npmjs.com/package/http-server/)或類似的軟體。在本專案的最上層資料夾以[`http-server`](https://www.npmjs.com/package/http-server/)進行測試的話，要跑：

```
npx http-server src
```

即可。這麼做就能在[`localhost:8080`](http://localhost:8080)上測試和開發，若`8080`埠無法使用則自己在命令裡加入`-p`和一個數字。

> [!NOTE]
> 要利用[`http-server`](https://www.npmjs.com/package/http-server/)需要先安裝`npm`或類似之軟件。

> [!TIP]
> 利用[`http-server`](https://www.npmjs.com/package/http-server/)進行測試的方法僅供參考。