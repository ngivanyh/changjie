<!-- Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) -->

# 暢頡 | `changjie`

## Description
`changjie` is a project designed to help you practice and learn Cangjie, an input method of Chinese that relies on typing different word "roots" that's based on how the character is written. Simplicity is this project's core philosophy, that means minimalist styling; no backends (just a simple server that hosts these static files); little to no external dependencies; and clean, concise code that makes this project hackable and extendable.

This project was originated from [`Cycatz/cangzen`](https://github.com/Cycatz/cangzen), but it extends the original functionality and adds some QOL improvements. These include:
- A more complete keyboard as a reference when learning the positions of the different keys
- Hiding the keyboard in layout mode to practice touch typing
- Smoother transitions between mode/theme switching
- Improved page performance (loading times and resource consumption)

## Attribution
Original work licensed under the MIT License ([here](LICENSE-ORIGINAL))

All further modifications (that differ from the original) is licensed under The Unlicense ([here](LICENSE))

Cangjie code table licnesed under the MIT License under a different name ([here](LICENSE-CANGJIE5)), some modifications were done to the code table.

[NotoSerifTC-Medium.woff2](fonts/NotoSerifTC-Medium.woff2) downloaded and then converted from [this](https://fonts.google.com/noto/specimen/Noto+Serif+TC) font which is licensed under the SIL OFL 1.1 license ([here](https://fonts.google.com/noto/specimen/Noto+Serif+TC/license)). (This font at first came from Google in `.ttf` format, later converted using [this tool](https://kombu.kanejaku.org/))

Icons in the [`/resources/fa-icons`](/resources/fa-icons/) directory licensed by Fonticons, Inc ([license](LICENSE-FONT-AWESOME)) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). 

## Testing/Development

Since this project relies on external resources (the Cangjie code table), you cannot put in the path to [`index.html`](index.html) in the browser and expect it to work. It must be hosted via something like [`http-server`](https://www.npmjs.com/package/http-server/v/13.0.1) with:

```
$ npx http-server
```

This will spin up an instance that will be available on [`localhost:8080`](http://localhost:8080). Or any other port on your machine with the `-p` option (if available).

> [!NOTE]
> An installation of `npm` or similar must be present in order to use [`http-server`](https://www.npmjs.com/package/http-server/v/13.0.1).

> [!TIP]
> [`http-server`](https://www.npmjs.com/package/http-server/v/13.0.1) is not the **only** tool you can use