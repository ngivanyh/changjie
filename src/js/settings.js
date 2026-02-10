/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

import { saveSettings, Cycler, reportErr, loadSettings} from "./helper.js";

class Setting extends Cycler {
    #saveParams;

    constructor(values = [], saveParams) {
        super(values);

        if (saveParams.length !== 2 || typeof (saveParams[0]) !== 'string' || typeof (saveParams[1]) !== 'boolean')
            reportErr('saveParams not to spec, expected list: [string, boolean]', false);

        this.#saveParams = saveParams;
    }

    // private save method so people cannot put in bogus values
    #save() { saveSettings(this.#saveParams[0], this.currentValue, this.#saveParams[1]); }
    // the parent methods + autosaving
    next() { super.next(); this.#save(); }
    prev() { super.prev(); this.#save(); }
    start() { super.start(); this.#save(); }
    end() { super.end(); this.#save(); }
    setByValue(value) { super.setByValue(value); this.#save(); }
}

class Settings {
    #mode;
    #theme;
    #regionPreference;
    #kbVisibility;

    constructor() {
        // user definable settings
        this.#theme = new Setting(['light', 'dark', 'forest', 'ocean', 'apple', 'ice', 'fire', 'royalty'], ['theme', true]);
        this.#regionPreference = new Setting(['hk', 'tw'], ['regionPreference', false]);
        this.#mode = new Setting(['layout', 'decomposition'], ['mode', true]);
        this.#kbVisibility = new Setting(['visible', 'hidden'], ['kbVisibility', true]);
    }

    // getters (object)
    get mode() { return this.#mode; }
    get theme() { return this.#theme; }
    get regionPreference() { return this.#regionPreference; }
    get kbVisibility() { return this.#kbVisibility; }
    // getters (value)
    get modeValue() { return this.#mode.currentValue; }
    get themeValue() { return this.#theme.currentValue; }
    get regionPreferenceValue() { return this.#regionPreference.currentValue; }
    get kbVisibilityValue() { return this.#kbVisibility.currentValue; }
}

const userSettings = new Settings();

const preferredColorScheme = (window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';

userSettings.theme.setByValue(loadSettings('theme', preferredColorScheme));
userSettings.mode.setByValue(loadSettings('mode', userSettings.modeValue));
userSettings.regionPreference.setByValue(loadSettings('regionPreference', userSettings.regionPreferenceValue));
userSettings.kbVisibility.setByValue(loadSettings('kbVisibility', userSettings.kbVisibilityValue));

export default userSettings;