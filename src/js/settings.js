/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

import { saveSettings, preferredColorScheme, Cycler, reportErr } from "./helper.js";

class Setting extends Cycler {
    #saveParams;

    constructor(values = [], saveParams) {
        super(values);

        if (saveParams.length !== 2 || typeof (saveParams[0]) !== 'string' || typeof (saveParams[1]) !== 'boolean'){
            reportErr('saveParams not to spec, expected list: [string, boolean]', false);
            throw new Error('saveParams not to spec, expected list: [string, boolean]');
        }

        this.#saveParams = saveParams;
    }

    save() { saveSettings(this.#saveParams[0], this.currentValue, this.#saveParams[1]); }
}

class Settings {
    constructor() {
    // user definable settings
        this.theme = new Setting(['light', 'dark'], ['theme', true]);
        this.regionPreference = new Setting(['hk', 'tw'], ['regionPreference', false]);
        this.mode = new Setting(['layout', 'decomposition'], ['mode', true]);
        this.kbVisibility = new Setting(['visible', 'hidden'], ['kbVisibility', true]);
    }

    saveAll() {
        this.theme.save();
        this.mode.save();
        this.regionPreference.save();
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