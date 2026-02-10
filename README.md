<!-- Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) -->

# `changjie`
### [繁體中文版本](README_zh-Hant.md)

## Table of Contents
1. [Description](#description)
2. [Usage](#usage)
3. [Attribution](#attribution)
4. [Testing/Development](#testingdevelopment)

## Description
`changjie` is a project designed to help you practice and learn Cangjie, an input method of Chinese that relies on typing different word "roots" that's based on how the character is written. Simplicity is this project's core philosophy, that means minimalist styling; no backends (just a simple server that hosts these static files, data is stored in `localStorage` and in the Cache); no external dependencies; and modern, concise code that makes this project hackable and extendable.

This project was originated from [`Cycatz/cangzen`](https://github.com/Cycatz/cangzen), but it extends the original functionality and adds some QOL improvements. These include:
- A more complete keyboard to reference when learning the key positions
- Leaving only the silhouette of the keyboard in layout mode to practice touch typing
- Smoother transitions between mode/theme switching
- Similar or improved page performance whilst having more to practice (≒ 16K characters, only including the more commonly used characters in Taiwan and Hong Kong)
- More themes! (Light, Dark, Forest, Ocean, Apple, Ice, Fire, Royalty; a tally of **8**)
- More responsive CSS for better adaptation across more devices

However, under the hood lies the most significant changes. 
- Central state and settings management
- Modern JavaScript practices
- Modular JavaScript to delegate different functions of the program
- Comments throughout core portions of the program to ensure maintainability

But that won't be all, these features are soon coming:
- Central settings page with custom footer customization (Issue: #8)
- Decomposition mode revamp (Issue: #7)
- Drastically improved mobile experience (Issue: #4)
- Practicing in sentences, rather than individual words (Issue: #10)

## Usage

## Attribution
Original work licensed under the [MIT License](LICENSE-ORIGINAL).

All further modifications (that differ from the original) licensed under [The Unlicense](LICENSE).

Cangjie code table licnesed under the [MIT License](LICENSE-CANGJIE5) under a different name, some modifications were done to the code table.

[`NotoSerifTC-Medium.woff2`](./src/styles/NotoSerifTC-Medium.woff2) was first downloaded (in `.ttf`) then converted to `.woff2` from [this font](https://fonts.google.com/noto/specimen/Noto+Serif+TC) which is licensed under the [SIL OFL 1.1 license](https://fonts.google.com/noto/specimen/Noto+Serif+TC/license). (conversion using [this tool](https://kombu.kanejaku.org/))

Icons licensed by Fonticons, Inc under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Testing/Development
This project uses [`vite`](https://vite.dev/) as a build tool, to test on your own setup or start developing, clone the repository first:

> [!IMPORTANT]  
> You must at least have a `git`, `node`, and `yarn` installed to follow these steps.

> [!WARNING]
> If you're not using HTTPS on your testing server, please make sure you're not using Chrome, Safari, or any web browser that only supports the Cache API in HTTPS contexts.

```
git clone https://github.com/ngivanyh/changjie.git
```

Then `cd` into the cloned repository.

```
cd changjie
```

Install the required develepment dependencies (which is [`vite`](https://vite.dev/)):

```
yarn install
```

To run the testing server, simply do:

```
yarn dev
```

To build:

```
yarn build
```

To preview the built webpage:

```
yarn preview
```

> [!NOTE]
> If you're deploying to github pages, you do not need to build the webpage to have it serve the built webpage. (Assuming you're using the [`deploy.yaml`](.github/workflows/deploy.yaml))