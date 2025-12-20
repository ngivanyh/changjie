/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

// constants
const $ = document;
const input = $.querySelector('#input-box');
const decompositionCursor = $.querySelector('#decomposition-cursor');
const cangjie_region_select = $.querySelector('#cangjie-select');
const charBox = $.querySelector('#test-char');
const keyToRadical = {"a":"日","b":"月","c":"金","d":"木","e":"水","f":"火","g":"土","h":"竹","i":"戈","j":"十","k":"大","l":"中","m":"一","n":"弓","o":"人","p":"心","q":"手","r":"口","s":"尸","t":"廿","u":"山","v":"女","w":"田","x":"難","y":"卜","z":"重",",":"，",".":"。",";":"；"};
const kbKeys = Object.fromEntries(
    Array.from(
        Object.keys(keyToRadical),
        k => [k, $.getElementById(`keyboard__key-${k}`)]
    )
);
const device_type = (/Android|webOS|iPhone|iPad|Mobile|Tablet/i.test(navigator.userAgent)) ? "mobile" : "desktop";
const preferred_color_scheme = window.matchMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light';

// small helper functions
const saveSettings = (k, v, isDocumentAttribute = true) => {
    if (isDocumentAttribute) $.documentElement.setAttribute(k, v);
    localStorage.setItem(k, v);

    return v;
};
const shake_box = () => {
    charBox.classList.add('shake');
    setTimeout(() => { charBox.classList.remove('shake'); }, 200);
};

// app related variables
let cangjieCodeTable = {};
let practicedIndex = Number(saveSettings('practiced_index', localStorage.getItem('practiced_index') || 0, false));
let testCharCode;
let testCharCodeLength;
let currentCodePos;

// settings
let regionPreference = saveSettings('region_preference', localStorage.getItem('region_preference') || 'hk', false);
let currentTheme = saveSettings('theme', localStorage.getItem('theme') || preferred_color_scheme);
let currentMode = saveSettings('mode', localStorage.getItem('mode') || 'layout');
let kbVisibility = saveSettings('kb_visible', localStorage.getItem('kb_visible') || 'visible');

let pressed_meta = false;

$.addEventListener('DOMContentLoaded', async () => {
    $.querySelector('#theme-toggle').addEventListener('click', () => {
        currentTheme = (currentTheme === 'light') ? saveSettings('theme', 'dark') : saveSettings('theme', 'light');;
    });

    $.querySelector('#kb-toggle').addEventListener('click', () => {
        kbVisibility = (kbVisibility === 'visible') ? saveSettings('kb_visible', 'hidden') : saveSettings('kb_visible', 'visible');
    });

    $.querySelector('#mode-toggle').addEventListener('click', () => {
        currentMode = (currentMode === 'decomposition') ? saveSettings('mode', 'layout') : saveSettings('mode', 'decomposition');;
        initPrac();
    });

    $.getElementsByName(`region-${regionPreference}`)[0].selected = true;

    cangjie_region_select.addEventListener('change', (event) => {
        regionPreference = saveSettings('region_preference', event.target.value, false);
        initPrac();
        cangjie_region_select.blur();
    })
    
    if (localStorage.hasOwnProperty('cangjieCodeTable'))
        cangjieCodeTable = JSON.parse(localStorage.getItem('cangjieCodeTable'))
    else {
        await fetch('./resources/cangjieCodeTable.min.json')
            .then(response => {
                if (!response.ok) {
                    alert(`Network request failed with status ${response.status}: ${response.statusText}. See console log output for more details.`)
                    throw new Error(`Network request failed with status ${response.status}: ${response.statusText}. See console log output for more details.`)
                }

                return response.json();
            })
            .then(data => {
                // Fisher-Yates-Durstenfeld Shuffle (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm)
                if (!data) {
                    alert(`Something went wrong with the resource fetch request. See console log output for more details`);
                    throw new Error(`Request data parse encountered an error. See console log output for more details`);
                }

                const data_keys = Object.keys(data);

                for (let i = 0; i < data_keys.length - 1; i++) {
                    const j = i + Math.floor(Math.random() * (data_keys.length - i));

                    [data_keys[i], data_keys[j]] = [data_keys[j], data_keys[i]];
                }

                for (const k of data_keys) {
                    cangjieCodeTable[k] = data[k];
                }

                localStorage.setItem('cangjieCodeTable', JSON.stringify(cangjieCodeTable));
            });
    }

    initPrac();

    if (device_type === 'mobile') {
        $.addEventListener('click', () => { input.focus() })
        input.addEventListener('keydown', keydownEvent);
        input.addEventListener('keyup', keyupEvent);
    } else {
        $.addEventListener('keydown', keydownEvent);
        $.addEventListener('keyup', keyupEvent);
    }
});

function initPrac() {
    // ressetting some ui elements
    decompositionCursor.innerHTML = '';
    cangjie_region_select.disabled = true;

    const char = Object.keys(cangjieCodeTable)[practicedIndex];
    const charCode = cangjieCodeTable[char]

    if (typeof(charCode) === 'object') {
        cangjie_region_select.disabled = false;
        testCharCode = charCode[regionPreference];
    } else {
        testCharCode = charCode;
    }

    testCharCodeLength = testCharCode.length;
    charBox.textContent = char;
    currentCodePos = 0;

    // decomp cursor generation
    for (let i = 0; i < testCharCodeLength; i++) {
        const decompositionCursorCharacter = $.createElement('span');
        decompositionCursorCharacter.classList.add('decomposition-cursor__character');
        if (currentMode === 'layout') decompositionCursorCharacter.textContent = keyToRadical[testCharCode[i]];
        decompositionCursor.appendChild(decompositionCursorCharacter);
    }

    // misc tasks needed for layout mode
    if (currentMode === 'layout') {
        $.querySelectorAll('.keyboard__key--blink').forEach(key => key.classList.remove('keyboard__key--blink'));

        kbKeys[testCharCode[0]].classList.add('keyboard__key--blink');
        decompositionCursor.children[0].classList.add('decomposition-cursor__character--blink')
    }
}

function keydownEvent(e) {
    const keyname = (e.key).toLowerCase();

    if (currentMode === "layout") {
        if (keyname === ' ') {
            kbVisibility = (kbVisibility === 'visible') ? saveSettings('kb_visible', 'hidden') : saveSettings('kb_visible', 'visible');
            return;
        }

        if (keyname === 'meta') {
            pressed_meta = true;
            return;
        }
        if (pressed_meta) {
            shake_box();
            return;
        }
        
        const keyboardKey = kbKeys[keyname];
        if (keyboardKey && !pressed_meta) {
            const decompositionCursorCharacter = decompositionCursor.children[currentCodePos];

            if (keyname === testCharCode[currentCodePos]) {
                keyboardKey.classList.add("keyboard__key--activated-correct");

                decompositionCursorCharacter.classList.remove("decomposition-cursor__character--blink");
                decompositionCursorCharacter.classList.add("decomposition-cursor__character-grayed");
                keyboardKey.classList.remove("keyboard__key--blink");

                currentCodePos++;

                if (currentCodePos === testCharCodeLength) {
                    practicedIndex = saveSettings('practiced_index', practicedIndex + 1, false);
                    initPrac();
                } else {
                    decompositionCursorCharacter.nextElementSibling.classList.add("decomposition-cursor__character--blink");
                    
                    kbKeys[testCharCode[currentCodePos]].classList.add("keyboard__key--blink");
                }
            } else {
                keyboardKey.classList.add("keyboard__key--activated-incorrect");
            }
        }
    } else { // mode: decomposition
        const decompositionCursorCharacter = decompositionCursor.children[currentCodePos];

        if(keyname === testCharCode[currentCodePos]){
            decompositionCursorCharacter.classList.remove("decomposition-cursor__character-grayed");

            decompositionCursorCharacter.textContent = keyToRadical[keyname];
            currentCodePos++;

            if(currentCodePos === testCharCodeLength) {
                practicedIndex = saveSettings('practiced_index', practicedIndex + 1, false);
                initPrac();
            }

        } else if (keyname === ' ') {
            decompositionCursorCharacter.textContent = keyToRadical[testCharCode[currentCodePos]];
            if (!decompositionCursorCharacter.classList.contains("decomposition-cursor__character-grayed"))
                decompositionCursorCharacter.classList.add("decomposition-cursor__character-grayed");
        } else if (keyname === 'enter') {
            for (const [i, decompositionCharacter] of Object.entries(decompositionCursor.children)) {
                if (!decompositionCharacter.classList.contains("decomposition-cursor__character-grayed") && !decompositionCharacter.textContent) {
                    decompositionCharacter.textContent = keyToRadical[testCharCode[i]];
                    decompositionCharacter.classList.add("decomposition-cursor__character-grayed");
                }
            }
        }
    }
}

function keyupEvent(e) {
    if (currentMode === 'layout') {
        const keyname = (e.key).toLowerCase();

        if (keyname === 'meta') {
            pressed_meta = false;
            return;
        }

        if (kbKeys[keyname])
            kbKeys[keyname].classList.remove('keyboard__key--activated-correct', 'keyboard__key--activated-incorrect');
    }

    if (device_type === 'mobile') input.value = '';
}