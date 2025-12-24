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
}
const shake_box = () => {
    charBox.classList.add('shake');
    setTimeout(() => { charBox.classList.remove('shake'); }, 200);
}

// app related variables
let cangjieCodeTable = JSON.parse(localStorage.getItem('cangjieCodeTable')) || {};
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

// event listeners for the typing
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

// init
initPrac();

async function retrieveCodeTable() {
    const report_err = (err_msg) => {
        alert(err_msg);
        console.error(err_msg);
    }

    const segmentDetails = localStorage.getItem('segment_details');

    // default fetch id and index (will be used when there is no previous record of a code table)
    let fetch_id = 'a';

    if (segmentDetails) {
        const segmentIndex = JSON.parse(segmentDetails)['segment-index'];
        fetch_id = (segmentIndex === 4) ? String.fromCharCode(97) : String.fromCharCode(98 + segmentIndex);
    }

    await fetch(`./resources/codeTable-gzipped/cangjieCodeTable-${fetch_id}.min.json.gz`)
        .then(response => {
            if (!response.ok) {
                report_err(`A network error occurred, the request to fetch a certain program resource has failed with ${response.status}: ${response.statusText}.`);
                throw new Error(err_msg);
            }

            if (response.headers.get('Content-Encoding') === 'gzip')
                return response.json();
            else {
                const ds = new DecompressionStream('gzip');
                return new Response(response.body.pipeThrough(ds)).json();
            }
        })
        .then(data => {
            if (!data || typeof(data) != 'object') {
                report_err('An error occurred whilst processing a certain program resource.');
                throw new Error(err_msg);
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
    
    // reset practiced index back to the starting point
    practicedIndex = Number(saveSettings('practiced_index', 0, false));
}

async function initPrac() {
    // resetting ui
    cangjie_region_select.disabled = true;
    $.querySelectorAll('.keyboard__key--blink').forEach(key => key.classList.remove('keyboard__key--blink'));

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
        decompCursorChar.classList.remove('decomposition-cursor__character-grayed', 'decomposition-cursor__character--blink');

        decompCursorChar.textContent = (currentMode === 'layout') ? keyToRadical[testCharCode[i]] : '';
    }
    Array.from(decompositionCursor.children).slice(testCharCodeLength).forEach(
        unused_cursor_char => unused_cursor_char.style.display = 'none'
    );

    // misc tasks needed for layout mode
    if (currentMode === 'layout') {
        kbKeys[testCharCode[0]].classList.add('keyboard__key--blink');
        decompositionCursor.children[0].classList.add('decomposition-cursor__character--blink');
    }
}

function keydownEvent(e) {
    const keyname = (e.key).toLowerCase();

    if (currentMode === 'layout')
        handleInput_layout(keyname);
    else
        handleInput_decomposition(keyname);
}

function handleInput_layout(keyname = '') {
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
    }
}

function handleInput_decomposition(keyname = '') {
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