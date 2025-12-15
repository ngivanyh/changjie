/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

const saveSettings = (k, v, isDocumentAttribute = true) => {
    if (isDocumentAttribute) $.documentElement.setAttribute(k, v);
    localStorage.setItem(k, v);

    return v
}
const shake_box = () => { charBox.classList.add('shake'); setTimeout(() => { charBox.classList.remove('shake'); }, 200) };

let cangjieCodeTable = {};
let practicedIndex = localStorage.hasOwnProperty('practicedIndex') ? saveSettings('practicedIndex', localStorage.getItem('practicedIndex'), false) : saveSettings('practicedIndex', 0, false);
let testChar;
let testCharCode;
let testCharCodeLength;
let currentCodePos;

let regionalPreference;
let currentTheme;
let currentMode;
let kbVisibility;

const $ = document
let decompositionCursor = $.getElementsByClassName('decomposition-cursor')[0];
const charBox = $.querySelector('#test-char');

const keyToRadical = {"a":"日","b":"月","c":"金","d":"木","e":"水","f":"火","g":"土","h":"竹","i":"戈","j":"十","k":"大","l":"中","m":"一","n":"弓","o":"人","p":"心","q":"手","r":"口","s":"尸","t":"廿","u":"山","v":"女","w":"田","x":"難","y":"卜","z":"z",",":"，",".":"。",";":"；"};
const enKeys = Object.keys(keyToRadical)
const input = $.querySelector('#input-box');
let pressed_meta = false;

const device_type = (/Android|webOS|iPhone|iPad|Mobile|Tablet/i.test(navigator.userAgent)) ? "mobile" : "desktop"

$.addEventListener('DOMContentLoaded', async function() {
    const preferred_color_scheme = window.matchMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light'
    currentTheme = localStorage.hasOwnProperty('theme') ? saveSettings('theme', localStorage.getItem('theme')) : saveSettings('theme', preferred_color_scheme);

    currentMode = localStorage.hasOwnProperty('mode') ? saveSettings('mode', localStorage.getItem('mode')) : saveSettings('mode', 'layout');

    kbVisibility = localStorage.hasOwnProperty('kb_visible') ? saveSettings('kb_visible', localStorage.getItem('kb_visible')) : saveSettings('kb_visible', 'visible');

    $.querySelector('#theme-toggle').addEventListener('click', () => {
        currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
        saveSettings('theme', currentTheme);
    });

    $.querySelector('#kb-toggle').addEventListener('click', () => {
        kbVisibility = (kbVisibility === 'visible') ? 'hidden' : 'visible';
        saveSettings('kb_visible', kbVisibility);
    });

    $.querySelector('#mode-toggle').addEventListener('click', () => {
        if (currentMode === "decomposition") {
            currentMode = "layout";
            initPrac();	
        } else {
            currentMode = "decomposition";
            initPrac();					
        }
        saveSettings('mode', currentMode)
    });
    
    if (localStorage.hasOwnProperty('cangjieCodeTable'))
        cangjieCodeTable = JSON.parse(localStorage.getItem('cangjieCodeTable'))
    else {
        await fetch('./resources/cangjieCodeTable.min.json')
            .then(response => {
                if (!response.ok) {
                    alert(`Network request failed with status ${response.status}: ${response.statusText}. See console log output for more details.`)
                    throw new Error(`Network request failed with status ${response.status}: ${response.statusText}. See console log output for more details.`)
                }

                return response.json()
            })
            .then(data => {
                // Fisher-Yates-Durstenfeld Shuffle (https://stackoverflow.com/questions/3718282/javascript-shuffling-objects-inside-an-object-randomize)
                const data_keys = Object.keys(data);

                for (let i = 0; i < data_keys.length - 1; i++) {
                    const j = i + Math.floor(Math.random() * (data_keys.length - i));

                    const temp = data_keys[j];
                    data_keys[j] = data_keys[i];
                    data_keys[i] = temp;
                }

                for (const k of data_keys) {
                    cangjieCodeTable[k] = data[k];
                }

                localStorage.setItem('cangjieCodeTable', JSON.stringify(cangjieCodeTable));
            });
    }

    initPrac();

    if (device_type === 'mobile') {
        $.addEventListener('click', () => {input.focus()})
        input.addEventListener('keydown', keydownEvent);
        input.addEventListener('keyup', keyupEvent);
    } else {
        $.addEventListener('keydown', keydownEvent);
        $.addEventListener('keyup', keyupEvent);
    }
});

function initPrac() {
    decompositionCursor.innerHTML = ''; // reset decomposition cursor
    testChar = Object.keys(cangjieCodeTable)[practicedIndex];
    if (typeof(testChar) === 'object') {

    }

    testCharCode = cangjieCodeTable[testChar]
    testCharCodeLength = testCharCode.length;
    charBox.textContent = testChar;
    currentCodePos = 0;

    if (currentMode === 'layout') {
        for (const k of enKeys) {
            let keyboardKey = $.getElementsByClassName(`keyboard__key-${k}`)[0];
            keyboardKey.classList.remove("keyboard__key--blink");
        }
        
        $.getElementsByClassName(`keyboard__key-${testCharCode[0]}`)[0].classList.add("keyboard__key--blink");

        // remove decomp cursor character blink and just have one overarching css class, then move the entire for loop before the if
        for (let i = 0; i < testCharCodeLength; i++) {
            let decompositionCursorCharacter = $.createElement('span');
            decompositionCursorCharacter.classList.add('decomposition-cursor__character');
            
            if (!i) decompositionCursorCharacter.className += " decomposition-cursor__character--blink";
            decompositionCursorCharacter.textContent = keyToRadical[testCharCode[i]];
            decompositionCursor.appendChild(decompositionCursorCharacter);					
        }
    } else {
        for (let i = 0; i < testCharCodeLength; i++) {
            let decompositionCursorCharacter = $.createElement('span');
            decompositionCursorCharacter.classList.add('decomposition-cursor__character');
            decompositionCursor.appendChild(decompositionCursorCharacter);					
        }
    }
}

function keydownEvent(e) {
    const keyname = (e.key).toLowerCase();
    console.log(keyname);

    if (currentMode === "layout") {
        if (keyname === ' ') {
            kbVisibility = (kbVisibility === 'visible') ? 'hidden' : 'visible';
            saveSettings('kb_visible', kbVisibility);
        }

        if (keyname === 'meta') { pressed_meta = true }
        if (pressed_meta) { shake_box() }
        
        let keyboardKey = $.getElementsByClassName(`keyboard__key-${keyname}`)[0];
        if (keyboardKey && !pressed_meta) {
            let decompositionCursorCharacter = $.getElementsByClassName('decomposition-cursor__character')[currentCodePos];
            if (keyname === testCharCode[currentCodePos]) {
                keyboardKey.classList.add("keyboard__key--activated-correct");
                decompositionCursorCharacter.classList.remove("decomposition-cursor__character--blink");
                decompositionCursorCharacter.classList.add("decomposition-cursor__character--finished");
                if (currentMode === "decomposition") {
                    decompositionCursorCharacter.textContent = keyToRadical[keyname];
                }
                keyboardKey.classList.remove("keyboard__key--blink");

                currentCodePos++;

                if (currentCodePos == testCharCodeLength) {
                    practicedIndex++;
                    initPrac();
                } else {
                    decompositionCursorCharacter.nextElementSibling.classList.add("decomposition-cursor__character--blink");
                    
                    let keyboardNextKey = $.getElementsByClassName(`keyboard__key-${testCharCode[currentCodePos]}`)[0];
                    keyboardNextKey.classList.add("keyboard__key--blink");
                }
            } else {
                keyboardKey.classList.add("keyboard__key--activated-incorrect");
            }
        }
    } else {
        let decompositionCursorCharacter = $.getElementsByClassName('decomposition-cursor__character')[currentCodePos];

        if(keyname === testCharCode[currentCodePos]){

            if(decompositionCursorCharacter.classList.contains("decomposition-cursor__character--hint"))
                decompositionCursorCharacter.classList.remove("decomposition-cursor__character--hint");

            decompositionCursorCharacter.textContent = keyToRadical[keyname];
            currentCodePos++;

            if(currentCodePos == testCharCodeLength) {
                practicedIndex++;
                initPrac();
            }
            
        } else if (keyname === ' ') {
            decompositionCursorCharacter.textContent = keyToRadical[testCharCode[currentCodePos]];
            if (!decompositionCursorCharacter.classList.contains("decomposition-cursor__character--hint"))
                decompositionCursorCharacter.classList.add("decomposition-cursor__character--hint");
        } else if (keyname === 'enter') {
            const decompositionCharacterBar = $.getElementsByClassName("decomposition-cursor")[0]
            for (const [i, decompositionCharacter] of decompositionCharacterBar.childNodes.entries()) {
                if (!decompositionCharacter.classList.contains("decomposition-cursor__character--hint") && !decompositionCharacter.textContent) {
                    decompositionCharacter.textContent = keyToRadical[testCharCode[i]];
                    decompositionCharacter.classList.add("decomposition-cursor__character--hint");
                }
            }
        }
    }
}

function keyupEvent(e) {
    if (currentMode === 'layout') {
        const keyname = (e.key).toLowerCase();

        if (keyname === 'meta') { pressed_meta = false }
        let keyboardKey = $.getElementsByClassName(`keyboard__key-${keyname}`)[0];
        if (keyboardKey) {
            keyboardKey.classList.remove("keyboard__key--activated-correct");
            keyboardKey.classList.remove("keyboard__key--activated-incorrect");
        }
    }

    input.value = '';
}