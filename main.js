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

// ui setup
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
});

async function retrieveCodeTable() {
    const segmentDetails = localStorage.getItem('segment_details');

    // reset practiced index back to the starting point
    practicedIndex = saveSettings('practiced_index', 0, false);

    // default fetch id and index (will be used when there is no previous record of a code table)
    const fetch_id = 'a';

    if (segmentDetails) {
        const segmentIndex = JSON.parse(segmentDetails)['segment-index'];

        if (segmentIndex === 4)
            fetch_id = String.fromCharCode(97); // id: 'a' (ascii/unicode: 97 + 0 -> index restarts at 0)
        else
            fetch_id = String.fromCharCode(97 + segmentIndex + 1);
    }

    await fetch(`./resources/cangjieCodeTable-segments/cangjieCodeTable-${fetch_id}.min.json`)
        .then(response => {
            if (!response.ok) {
                alert(`A network error occurred, the request to fetch a certain program resource has failed with ${reponse.status}: ${response.statusText}.`);
                throw new Error(`A network error occurred, the request to fetch a certain program resource has failed with ${reponse.status}: ${response.statusText}.`);
            }

            return reponse.json();
        })
        .then(data => {
            if (!data || typeof(data) != 'object') {
                alert('An error occurred whilst processing a certain program resource.');
                throw new Error('An error occurred whilst processing a certain program resource.');
            }

            const data_keys = Object.keys(data.data);

            for (let i = 0; i < data_keys.length - 1; i++) {
                const j = i + Math.floor(Math.random() * (data_keys.length - i));

                [data_keys[i], data_keys[j]] = [data_keys[j], data_keys[i]];
            }

            for (const k of data_keys) {
                cangjieCodeTable[k] = data.data[k];
            }

            localStorage.setItem('cangjieCodeTable', JSON.stringify(cangjieCodeTable));
            localStorage.setItem('segment_details', JSON.stringify(data.details));
        });
}

$.addEventListener('DOMContentLoaded', async () => {
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
        $.querySelector('main').addEventListener('click', () => {
            if ($.activeElement != input) input.focus();
        });
        input.addEventListener('keydown', keydownEvent);
        input.addEventListener('keyup', keyupEvent);
    } else {
        $.addEventListener('keydown', keydownEvent);
        $.addEventListener('keyup', keyupEvent);
    }
});

async function initPrac() {
    // resetting the region selection
    cangjie_region_select.disabled = true;

    if (!Object.keys(cangjieCodeTable)[practicedIndex]) {
        await retrieveCodeTable();
    }
    const char = Object.keys(cangjieCodeTable)[practicedIndex];
    const charCode = cangjieCodeTable[char];

    if (typeof(charCode) === 'object') {
        cangjie_region_select.disabled = false; // re-enable selection
        testCharCode = charCode[regionPreference];
    } else {
        testCharCode = charCode;
    }

    testCharCodeLength = testCharCode.length;
    charBox.textContent = char;
    currentCodePos = 0;

    // decomp cursor generation
    for (const [i, decompCursorChar] of Object.entries(decompositionCursor.children)) {
        decompCursorChar.style.display = 'inline-block';
        decompCursorChar.classList.remove('decomposition-cursor__character-grayed');
        decompCursorChar.classList.remove('decomposition-cursor__character--blink');

        if (currentMode === 'layout')
            decompCursorChar.textContent = keyToRadical[testCharCode[i]];
        else
            decompCursorChar.textContent = '';
    }
    Array.from(decompositionCursor.children).slice(testCharCodeLength).forEach(
        unused_cursor_char => unused_cursor_char.style.display = 'none'
    );

    // misc tasks needed for layout mode
    if (currentMode === 'layout') {
        $.querySelectorAll('.keyboard__key--blink').forEach(key => key.classList.remove('keyboard__key--blink'));

        kbKeys[testCharCode[0]].classList.add('keyboard__key--blink');
        decompositionCursor.children[0].classList.add('decomposition-cursor__character--blink');
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
                keyboardKey.classList.add('keyboard__key--activated-correct');

                decompositionCursorCharacter.classList.remove('decomposition-cursor__character--blink');
                decompositionCursorCharacter.classList.add('decomposition-cursor__character-grayed');
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