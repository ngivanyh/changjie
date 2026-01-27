import { Cycler, decomposedChars } from "./helper.js";

class State {
    #testCharCode;
    #testCharCodeLength;
    #currentCodeIndex;
    #currentCodeChar;
    #currentDecomposedChar;
    #pressedMeta;

    constructor() {
        this.#testCharCode = '';
        this.#testCharCodeLength = 0;
        this.#currentCodeIndex = undefined; // undefined because testCharCode is ''
        this.#currentCodeChar = '';
        this.#currentDecomposedChar = undefined;
        this.#pressedMeta = new Cycler([false, true]);
    }

    newTestCharacter(testCharCode) {
        this.#testCharCode = testCharCode;
        this.#testCharCodeLength = this.#testCharCode.length;
        this.#currentCodeIndex = 0;
        this.#currentCodeChar = this.#testCharCode[this.#currentCodeIndex];
        this.#currentDecomposedChar = decomposedChars[this.#currentCodeIndex];
    }

    incrementCodePosition(increment = 1) {
        if ((this.#currentCodeIndex + increment) === this.#testCharCodeLength)
            return 0; // user has finished practicing this character

        this.#currentCodeIndex += increment;
        this.#currentCodeChar = this.#testCharCode[this.#currentCodeIndex];
        this.#currentDecomposedChar = decomposedChars[this.#currentCodeIndex];
        return increment;
    }

    // getters
    get testCharCode() { return this.#testCharCode; }
    get testCharCodeLength() { return this.#testCharCodeLength; }
    get currentIndex() { return this.#currentCodeIndex; }
    get currentChar() { return this.#currentCodeChar; }
    get currentDecomposedChar() { return this.#currentDecomposedChar; }
    get metaState() { return this.#pressedMeta.currentValue; }

    // setter for metaState
    set metaState(value) { this.#pressedMeta.setByValue(value); }
}

const appState = new State();

export default appState;