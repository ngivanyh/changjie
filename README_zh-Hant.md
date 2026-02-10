<!-- Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) -->

# 暢頡
### [English Version](README.md)

## 目錄
1. [說明](#說明)
2. [操作方式](#操作方式)
3. [版權聲明](#版權聲明)
4. [測試/開發](#測試開發)

## 說明
倉頡是一個輸入字根的輸入法，這些字根表示的是繁體中文字的筆畫的一部分。而此網站「暢頡」是一個倉頡練習軟體，以簡潔為其設計理念，卻依舊能提供一個全面性的倉頡學習或練習的體驗。資料全部存去在使用者端中，且無外部附加模組；簡單和淺顯易懂的介面；彈性的程式碼，讓之後擴充方便。

此專案原本由[`Cycatz/cangzen`](https://github.com/Cycatz/cangzen)而來，為其延伸，以下為增加的功能：
- 較完整的鍵盤，使對照鍵位更加輕鬆
- 鍵盤的顯示開關，以練習不看鍵盤打字
- 介面轉場效果
- 在能練習更多的字的情況下（≒ 1.6萬字，僅包含台灣和香港常用字和詞常用字），類似或提升的網頁速度
- 更多介面樣式 （淺色、深色、森林、海洋、蘋果、冰雪、火焰、王室，共**八**個）

但改變不僅如此，與原本差最多的為程式碼本身，改變為下：
- 中央管理使用者設定和網頁狀態
- 現代JavaScript程式手法
- 模組化程式碼
- （英語）程式碼提示語

除此之外，之後還希望增加這些功能：
- 設定頁面和可編輯之頁尾（GitHub Issue: #8）
- 拆字模式改版（GitHub Issue: #7）
- 可攜帶式裝置使用優化（GitHub Issue: #4）
- 句子式練習（GitHub Issue: #10）

## 操作方式

## 版權聲明
所有原本程式碼以[MIT License](LICENSE-ORIGINAL)發行。

所有本專案對於原本程式碼的更改以[Unlicense](LICENSE)發行。

倉頡對照表之資料由其他專案而來，所有原本著作在另一個[MIT License](LICENSE-CANGJIE5)下發行。

[`NotoSerifTC-Medium.woff2`](./src/styles/NotoSerifTC-Medium.woff2)字體從`.ttf`格式轉為`.woff2`格式（[來源](https://fonts.google.com/noto/specimen/Noto+Serif+TC)）；字體由[SIL OFL 1.1 license](https://fonts.google.com/noto/specimen/Noto+Serif+TC/license)發行。([轉換工具](https://kombu.kanejaku.org/))

## 測試/開發
本專案使用[`vite`](https://vite.dev/)，請根據以下步驟以進行個人的內部測試或開發：

> [!IMPORTANT]  
> 您先需有`git`、`node`、`yarn`才可以執行後面的操作。

> [!WARNING]
> 若您的測試伺服器無HTTPS連線，請勿使用Chrome、Safari等只能在有HTTPS的條件下使用Cache API的瀏覽器。

```
git clone https://github.com/ngivanyh/changjie.git
```

在`cd`到`changjie`的資料夾中。

```
cd changjie
```

安裝所需專案（為[`vite`](https://vite.dev/)）:

```
yarn install
```

若要進行個人內部測試，直接執行一下指令：

```
yarn dev
```

合成網頁：

```
yarn build
```

預覽合成網頁：

```
yarn preview
```

> [!NOTE]
> 假設要上傳到Github Pages，您不需先合成網頁，使用[`deploy.yaml`](.github/workflows/deploy.yaml)在Github Actions中執行即可。