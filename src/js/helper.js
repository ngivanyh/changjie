/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

// constants (ui elements, useful lists, etc)
export const input = document.querySelector('#input-box');
export const charBox = document.querySelector('#test-char');
export const cangjieRegionSelection = document.querySelector('#cangjie-select');
export const decomposedChars = Array.from(
    document.querySelector('#decomposed-characters').children,
);
export const preferredColorScheme = (window.matchMedia('(prefers-color-scheme: dark)')) ? 'dark' : 'light';
export const deviceType = (/Android|webOS|iPhone|iPad|Mobile|Tablet/i.test(navigator.userAgent)) ? 'mobile' : 'desktop';
export const keyToRadicalTable = {
    'a': '日',
    'b': '月',
    'c': '金',
    'd': '木',
    'e': '水',
    'f': '火',
    'g': '土',
    'h': '竹',
    'i': '戈',
    'j': '十',
    'k': '大',
    'l': '中',
    'm': '一',
    'n': '弓',
    'o': '人',
    'p': '心',
    'q': '手',
    'r': '口',
    's': '尸',
    't': '廿',
    'u': '山',
    'v': '女',
    'w': '田',
    'x': '難',
    'y': '卜',
    'z': '重',
    ',': '，',
    '.': '。',
    ';': '；',
};

export const kbKeys = Object.fromEntries(
    Array.from(Object.keys(keyToRadicalTable), (k) => [
        k,
        document.getElementById(`keyboard-key-${k}`),
    ]),
);

export const decomposedCharClasses = {
    'grayed': 'decomposed-character-grayed',
    'selected': 'decomposed-character-selected',
};

export const keyboardKeyClasses = {
    'blink': 'keyboard-key-blink',
    'activated': {
        'correct': 'keyboard-key-activated-correct',
        'incorrect': 'keyboard-key-activated-incorrect',
    },
};

// helper functions
export const saveSettings = (k, v, isDocumentAttribute = true) => {
    if (isDocumentAttribute) document.documentElement.setAttribute(k, v);
    localStorage.setItem(k, v);

    return v;
};

export const shake_box = () => {
    charBox.classList.add('shake');
    setTimeout(() => {
        charBox.classList.remove('shake');
    }, 200);
};

export const reportErr = (err_msg, alert = true) => {
    if (alert) alert(err_msg);
    console.error(err_msg);
};

export class Cycler {
    constructor(values = []) {
        if (values.length === 0) {
            reportErr('No values passed for cycling', false);
            throw new Error('No values passed for cycling');
        }

        // default set to the first item
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
        this.currentIndex =
            (this.currentIndex - 1 + this.quantity) % this.quantity;
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
        if (!this.values.includes(value)) {
            reportErr(`${value} not in values to cycle`);
            throw new Error(`${value} not in values to cycle`);
        }

        this.currentIndex = this.values.indexOf(value);
        this.currentValue = this.values[this.currentIndex];
    }
}
