import { Cycler, decomposedChars } from "./helper.js";

class State {
    constructor() {
        this.testCharCode = '';
        this.testCharCodeLength = 0;
        this.currentCodePos = undefined; // undefined because testCharCode is ''
        this.currentCodeChar = '';
        this.currentDecomposedChar = undefined;
        this.pressedMeta = new Cycler([false, true]);
    }

    newTestCharacter(testCharCode) {
        this.testCharCode = testCharCode;
        this.testCharCodeLength = this.testCharCode.length;
        this.currentCodePos = 0;
        this.currentCodeChar = this.testCharCode[this.currentCodePos];
        this.currentDecomposedChar = decomposedChars[this.currentCodePos];
    }

    incrementCodePosition(increment = 1) {
        if ((this.currentCodePos + increment) === this.testCharCodeLength)
            return 0; // user has finished practicing this character

        this.currentCodePos += increment;
        this.currentCodeChar = this.testCharCode[this.currentCodePos];
        this.currentDecomposedChar = decomposedChars[this.currentCodePos];
        return increment;
    }

    resetAll() {
        this.testCharCode = '';
        this.testCharCodeLength = 0;
        this.currentCodePos = 0;
        this.currentCodeChar = '';
        this.currentDecomposedChar = undefined;
        this.pressedMeta.start();
    }
}

const appState = new State();

export default appState;