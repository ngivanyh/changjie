/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

import { reportErr } from "./helper.js";

// cycle, default value is the first element of the list provided
class Cycle {
    constructor(values = []) {
        if (values.length === 0) {
            reportErr('No values passed for cycling', false);
            throw new Error('No values passed for cycling');
        }

        this.currentIndex = 0;
        this.values = values;
        this.quantity = this.values.length;
        this.currentValue = this.values[this.currentIndex];
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.quantity;
        this.currentValue = this.values[this.currentIndex];
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.quantity) % this.quantity;
        this.currentValue = this.values[this.currentIndex];
    }

    start() {
        this.currentIndex = 0;
        this.currentValue = this.values[this.currentIndex];
    }

    end() {
        this.currentIndex = this.quantity - 1;
        this.currentValue = this.values[this.currentIndex];
    }

    setByIndex(index = 0) {
        if (!(this.quantity - 1 >= index >= 0)) {
            reportErr('Index out of range of Cycle', false);
            throw new Error('Index out of range of Cycle');
        }

        this.currentIndex = index;
        this.currentValue = this.values[this.currentIndex];
    }

    setByValue(value) {

    }
}

export class CangjiePracticeStates {
    constructor() {
        // user definable settings
        this.regionalPreference = new Cycle(['hk', 'tw']);
        this.mode = new Cycle(['layout', 'decomposition']);
        this.theme = new Cycle(['light', 'dark']);
        this.kbVisibility = new Cycle(['visible', 'hidden']);

        // program state variables
        // this.currentTestChar = 
    }
}