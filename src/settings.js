/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

import { reportErr, saveSettings, preferredColorScheme } from "./helper.js";

// cycle, default value is the first element of the list provided
class Setting {
    constructor(values = [], savedAs = '', autosave = false, saveParams = []) {
        if (values.length === 0) {
            reportErr('No values passed for cycling', false);
            throw new Error('No values passed for cycling');
        }

        // default set to the first item
        this.currentIndex = 0;
        this.values = values;
        this.quantity = this.values.length;
        this.currentValue = this.values[this.currentIndex];
    
        if (!autosave) {
            this.autosave = false;
            this.saveParams = [];
        } else {
            this.autosave = true;
            this.saveParams = saveParams;
        }

        if (!savedAs) console.warn('Alias to use when saving setting has not been set')
        this.savedAs = savedAs;
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
        if (!this.values.includes(value)) {
            reportErr(`${value} not in values to cycle`);
            throw new Error(`${value} not in values to cycle`);
        }

        this.currentIndex = this.values.indexOf(value);
        this.currentValue = this.values[this.currentIndex];
    }

    save(key = this.savedAs, isDocumentAttribute = true) {
        saveSettings(key, this.currentValue, isDocumentAttribute);
    }
}

class Settings {
    constructor() {
    // user definable settings
        this.theme = new Setting(['light', 'dark'], 'theme');
        this.regionPreference = new Setting(['hk', 'tw'], 'regionPreference');
        this.mode = new Setting(['layout', 'decomposition'], 'mode');
        this.kbVisibility = new Setting(['visible', 'hidden'], 'kbVisibility');
    }

    saveAll() {
        this.theme.save();
        this.mode.save();
        this.regionPreference.save(this.regionPreference.savedAs, false);
        this.kbVisibility.save();
    }
}

const userSettings = new Settings();

userSettings.theme.setByValue(localStorage.getItem('theme') || preferredColorScheme);
userSettings.mode.setByValue(localStorage.getItem('mode') || 'layout');
userSettings.regionPreference.setByValue(localStorage.getItem('regionPreference') || 'hk');
userSettings.kbVisibility.setByValue(localStorage.getItem('kbVisibility') || 'visible');
userSettings.saveAll();

export default userSettings;