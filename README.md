<!-- Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) -->

# 暢頡 | `changjie`

## Table of Contents {#table-of-contents}
1. [ToC](#table-of-contents)
2. [Description](#description)
3. [Usage](#usage)
4. [Attribution](#attribution)
5. [Testing/Development](#testingdevelopment)

## Description
`changjie` is a project designed to help you practice and learn Cangjie, an input method of Chinese that relies on typing different word "roots" that's based on how the character is written. Simplicity is this project's core philosophy, that means minimalist styling; no backends (just a simple server that hosts these static files, data is stored in `localStorage`); little to no external dependencies; and clean, concise code that makes this project hackable and extendable.

This project was originated from [`Cycatz/cangzen`](https://github.com/Cycatz/cangzen), but it extends the original functionality and adds some QOL improvements. These include:
- A more complete keyboard to reference when learning the key positions
- Hiding the keyboard in layout mode to practice touch typing
- Smoother transitions between mode/theme switching
- Improved page performance (loading times and resource consumption)
- A wider breadth of characters to practice (≒30K characters)

But that won't be all, these features are soon coming:
- More themes (#9)
- Decomposition mode revamp (#7)
- Drastically improved mobile experience (#4)
- Practicing in sentences, rather than individual words (#10)

## Usage
You open up the [webpage](https://ngivanyh.github.io/changjie) for the first time and you'll be greeted with the first mode: layout practice. This mode is designed to help you learn the different key positions of the Cangjie word roots.

You can toggle the theme in the bottom left, this will alternate between the different themes.

In the middle is the keyboard visibility toggle, when you think you've gotten familiar with the key positions, you can cement your memorization by turning off the text on the keyboard. You can either press the eye icon or press space.

When you see the character box shaking:


## Attribution
Original work licensed under the [MIT License](LICENSE-ORIGINAL).

All further modifications (that differ from the original) licensed under [The Unlicense](LICENSE).

Cangjie code table licnesed under the [MIT License](LICENSE-CANGJIE5) under a different name, some modifications were done to the code table.

[`NotoSerifTC-Medium.woff2`](fonts/NotoSerifTC-Medium.woff2) was first downloaded (in `.ttf`) then converted to `.woff2` from this font [here](https://fonts.google.com/noto/specimen/Noto+Serif+TC) font which is licensed under the SIL OFL 1.1 license ([here](https://fonts.google.com/noto/specimen/Noto+Serif+TC/license)). (conversion using [this tool](https://kombu.kanejaku.org/))

Icons in the [`/resources/fa-icons`](./resources/fa-icons/) directory licensed by Fonticons, Inc under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Testing/Development

Since this project relies on external resources (the Cangjie code table), you cannot put in the path to [`index.html`](index.html) in the browser and expect it to work. It must be hosted via something like [`http-server`](https://www.npmjs.com/package/http-server/v/13.0.1) with:

```
$ npx http-server
```

This will spin up an instance that will be available on [`localhost:8080`](http://localhost:8080). Or any other port on your machine with the `-p` option (if available).

> [!NOTE]
> An installation of `npm` or similar must be present in order to use [`http-server`](https://www.npmjs.com/package/http-server/).

> [!TIP]
> [`http-server`](https://www.npmjs.com/package/http-server/v/13.0.1) is not the **only** tool you can use, as long as it can serve these static files, it is an adequate tool.