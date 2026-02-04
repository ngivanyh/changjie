/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

import { Cycler, decomposedChars, loadSettings, saveSettings } from "./helper.js";

class State {
    #testCharCode;
    #testCharCodeLength;
    #currentCodeIndex;
    #currentCodeChar;
    #currentDecomposedChar;
    #pressedMeta;
    #practiceIndex

    constructor() {
        this.#testCharCode = '';
        this.#testCharCodeLength = 0;
        this.#currentCodeIndex = undefined; // undefined because testCharCode is ''
        this.#currentCodeChar = '';
        this.#currentDecomposedChar = undefined;
        this.#pressedMeta = new Cycler([false, true]);
        this.#practiceIndex = Number(loadSettings('practiceIndex', 0));
    }

    newTestCharacter(testCharCode) {
        this.#testCharCode = testCharCode;
        this.#testCharCodeLength = this.#testCharCode.length;
        this.#currentCodeIndex = 0;
        this.#currentCodeChar = this.#testCharCode[this.#currentCodeIndex];
        this.#currentDecomposedChar = decomposedChars[this.#currentCodeIndex];
    }

    resetPracticeIndex() { this.#practiceIndex = saveSettings('practiceIndex', 0, false); }

    incrementCodePosition(increment = 1) {
        if ((this.#currentCodeIndex + increment) === this.#testCharCodeLength) {
            this.#practiceIndex = saveSettings('practiceIndex', (this.#practiceIndex + 1) % 29463, false);
            // 29462 is the number of entries in the code table
            return 0; // user has finished practicing this character
        }

        this.#currentCodeIndex += increment;
        this.#currentCodeChar = this.#testCharCode[this.#currentCodeIndex];
        this.#currentDecomposedChar = decomposedChars[this.#currentCodeIndex];
        return increment;
    }

    // getters (the fields themselves)
    get testCharCode() { return this.#testCharCode; }
    get testCharCodeLength() { return this.#testCharCodeLength; }
    get currentIndex() { return this.#currentCodeIndex; }
    get currentChar() { return this.#currentCodeChar; }
    get currentDecomposedChar() { return this.#currentDecomposedChar; }
    get metaState() { return this.#pressedMeta; }
    get practiceIndex() { return this.#practiceIndex; }
    // getters (values)
    get metaStateValue() { return this.#pressedMeta.currentValue; }
}

const appState = new State();

export default appState;