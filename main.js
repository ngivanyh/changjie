/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

let cangjieCodeTable; 
let testChar;
let testCharCode;
let testCharCodeLength;
let currentCodePos;

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

const array_rand = (arr) => { return arr[Math.floor(Math.random() * arr.length)] };
const saveSettings = (k, v) => { $.documentElement.setAttribute(k, v); localStorage.setItem(k, v); }
const shake_box = () => { charBox.classList.add('shake'); setTimeout(() => { charBox.classList.remove('shake'); }, 200) }

fetch('./resources/cangjieCodeTable.min.json')
    .then(response => {
        if (!response.ok) {
            alert(`Network request failed with status ${response.status}: ${response.statusText}. See console log output for more details.`)
            console.log(`${response.json()}`);
        }

        return response.json()
    })
    .then(data => {
        cangjieCodeTable = data;
        if (cangjieCodeTable === undefined || cangjieCodeTable === null) return;

        // config (mode, theme, kb vis)
        const preferred_color_scheme = window.matchMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light'
        currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : preferred_color_scheme;
        saveSettings('theme', currentTheme)

        currentMode = localStorage.getItem('mode') ? localStorage.getItem('mode') : 'layout';
        saveSettings('mode', currentMode)

        kbVisibility = localStorage.getItem('kb_visible') ? localStorage.getItem('kb_visible') : 'visible'
        saveSettings('kb_visible', kbVisibility)

        const _ = (currentMode === "decomposition") ? initPrac() : initPrac()

        $.querySelector('#theme-toggle').addEventListener('click', () => {
            currentTheme = (currentTheme === 'light') ? 'dark' : 'light'
            saveSettings('theme', currentTheme)
        });

        $.querySelector('#kb-toggle').addEventListener('click', () => {
            if (currentMode === 'layout') {
                kbVisibility = (kbVisibility === 'visible') ? 'hidden' : 'visible'
                saveSettings('kb_visible', kbVisibility)
            }
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
    decompositionCursor.innerHTML = ''; // unprocessed

    testChar = array_rand(Object.keys(cangjieCodeTable));
    testCharCode = array_rand(cangjieCodeTable[testChar]) 
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

            if(currentCodePos == testCharCodeLength)
                initPrac();
            
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