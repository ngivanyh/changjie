<!-- Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) -->

# 暢頡 | `changjie`

## Description
`changjie` is a project designed to help you practice and learn Cangjie, an input method of Chinese that relies on typing different word "roots" that's based on how the character is written. This program derives from others in its simplicity, but still has all the features needed to practice and learn the Cangjie input method.

This project was originally forked from [`Cycatz/cangzen`](https://github.com/Cycatz/cangzen), but it extends the original functionality and adds some QOL improvements. These include:
- A more complete keyboard as a reference when learning the positions of the different keys
- Hiding the keyboard in layout mode to practice touch typing
- Smoother transitions between mode/theme switching
- Improved page performance (loading times and resource consumption)

## Attribution
Original work licensed under the MIT License ([here](LICENSE-ORIGINAL))

Cangjie code table licnesed under the MIT License under a different name than the former ([here](LICENSE-CANGJIE5)), modifications were done to the code table.

[NotoSerifTC-Medium](fonts/NotoSerifTC-Medium.woff2) converted from the [Noto Serif TC](https://fonts.google.com/noto/specimen/Noto+Serif+TC) font which is under the SIL OFL 1.1 license [here](https://fonts.google.com/noto/specimen/Noto+Serif+TC/license). (Downloading this font from Google originally in `.ttf` format; conversion tool: [https://kombu.kanejaku.org/](https://kombu.kanejaku.org/))

Icons in the [`/resources/fa-icons`](/resources/fa-icons/) directory licensed by Fonticons, Inc ([license](LICENSE-FONT-AWESOME)) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). 

All further modifications done in this repo is licensed under The Unlicense ([here](LICENSE))

## Testing/Development

Since this project relies on external resources, you cannot just open [`index.html`](index.html) and expect it to work. The website must be hosted via something like [`http-server`](https://www.npmjs.com/package/http-server/v/13.0.1) with:

```
$ npx http-server
```

Then an instance will be available on [`localhost:8080`](http://localhost:8080).

> Note an installation of `npm` or similar must be available in order to use [`http-server`](https://www.npmjs.com/package/http-server/v/13.0.1) and related tools.