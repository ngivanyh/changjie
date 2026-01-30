<!-- Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) -->

# `changjie`
### [繁體中文](README_zh-Hant.md)

## Table of Contents
1. [Description](#description)
2. [Usage](#usage)
3. [Attribution](#attribution)
4. [Testing/Development](#testingdevelopment)

## Description
`changjie` is a project designed to help you practice and learn Cangjie, an input method of Chinese that relies on typing different word "roots" that's based on how the character is written. Simplicity is this project's core philosophy, that means minimalist styling; no backends (just a simple server that hosts these static files, data is stored in `localStorage` (`IndexedDB` migration coming)); no external dependencies; and clean, concise code that makes this project hackable and extendable.

This project was originated from [`Cycatz/cangzen`](https://github.com/Cycatz/cangzen), but it extends the original functionality and adds some QOL improvements. These include:
- A more complete keyboard to reference when learning the key positions
- Leaving only the silhouette of the keyboard in layout mode to practice touch typing
- Smoother transitions between mode/theme switching
- Similar or improved page performance whilst having more to practice (≒ 30K characters!)
- More themes! (Light, Dark, Forest, Ocean, Apple, Ice)

But that won't be all, these features are soon coming:
- Decomposition mode revamp (Issue: #7)
- Drastically improved mobile experience (Issue: #4)
- Practicing in sentences, rather than individual words (Issue: #10)

Current Todos:
- [ ] Key stagger option
- [ ] indexeddb

## Usage
You open up the [webpage](https://ngivanyh.github.io/changjie) for the first time and you'll be greeted with the first mode: layout practice. This mode is designed to help you learn the different key positions of the Cangjie word roots.

You can toggle the theme in the bottom left, this will alternate between the different themes.

In the middle is the keyboard visibility toggle, when you think you've gotten familiar with the key positions, you can cement your memorization by turning off the text on the keyboard. You can either press the eye icon or press space.

When you see the character box shaking, it means you've pressed the meta key on your operating system. (it is a measure to inform of a bug where the operating system first registers the keyboard shortcut with the meta key then leaves the webpage stuck on an uninputable state)

Clicking on the bottom right turns the program into decomposition mode. This mode forces you to decompose each individual Chinese character into its 1–5 word roots. Clicking on each decomposed character can give a gray hint, so can pressing enter (hints all), and pressing space (hints on the current character).


## Attribution
Original work licensed under the [MIT License](LICENSE-ORIGINAL).

All further modifications (that differ from the original) licensed under [The Unlicense](LICENSE).

Cangjie code table licnesed under the [MIT License](src/resources/LICENSE-CANGJIE5) under a different name, some modifications were done to the code table.

[`NotoSerifTC-Medium.woff2`](fonts/NotoSerifTC-Medium.woff2) was first downloaded (in `.ttf`) then converted to `.woff2` from [this font](https://fonts.google.com/noto/specimen/Noto+Serif+TC) which is licensed under the [SIL OFL 1.1 license](https://fonts.google.com/noto/specimen/Noto+Serif+TC/license). (conversion using [this tool](https://kombu.kanejaku.org/))

Icons licensed by Fonticons, Inc under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Testing/Development

Since this project relies on external resources (the Cangjie code table), you cannot put in the path to [`index.html`](./src/index.html) in the browser, it will not function properly. It must be hosted via something like [`http-server`](https://www.npmjs.com/package/http-server/) with:

```
npx http-server src
```

Assuming you are in the root directory of this repository and run that command. This will spin up an instance that will be available on [`localhost:8080`](http://localhost:8080). Or any other port on your machine with the `-p` option (if available).

> [!NOTE]
> An installation of `npm` or similar must be present in order to use [`http-server`](https://www.npmjs.com/package/http-server/).

> [!TIP]
> [`http-server`](https://www.npmjs.com/package/http-server/) is not the **only** tool you can use, as long as it can serve these static files, it is an adequate tool.