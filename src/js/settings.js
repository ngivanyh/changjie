/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

import { saveSettings, preferredColorScheme, Cycler } from "./helper.js";

class Setting extends Cycler {
    constructor(values = [], savedAs = '') {
        super(values);

        if (!savedAs) console.warn('Alias to use when saving setting has not been set')
        this.savedAs = savedAs;
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