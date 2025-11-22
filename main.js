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

const array_rand = (arr) => {return arr[Math.floor(Math.random() * arr.length)]};

function saveSettings(k, v) {
    $.documentElement.setAttribute(k, v);
    localStorage.setItem(k, v);
}

const request = new XMLHttpRequest();
request.open('GET', './resources/cangjieCodeTable.min.json');
request.responseType = 'json';
request.onload = function(){
    if (this.status >= 200 && this.status < 400) {
        cangjieCodeTable = request.response;

        // config (mode, theme, kb vis)
        currentTheme = window.matchMedia("(prefers-color-scheme: light)") ? 'light' : 'dark';
        saveSettings('theme', currentTheme)

        currentMode = localStorage.getItem('mode') ? localStorage.getItem('mode') : 'layout';
        saveSettings('mode', currentMode)

        kbVisibility = localStorage.getItem('kb_visible') ? localStorage.getItem('kb_visible') : 'visible'
        saveSettings('kb_visible', kbVisibility)

        const _ = (currentMode === "decomposition") ? initDecompPrac() : initLayoutPrac()

        $.querySelector('#theme-toggle').addEventListener('click', (e) => {
            currentTheme = (currentTheme === 'light') ? 'dark' : 'light'
            saveSettings('theme', currentTheme)
        });

        $.querySelector('#kb-toggle').addEventListener('click', (e) => {
            if (currentMode === 'layout') {
                kbVisibility = (kbVisibility === 'visible') ? 'hidden' : 'visible'
                saveSettings('kb_visible', kbVisibility)
            }
        });

        $.querySelector('#mode-toggle').addEventListener('click', (e) => {
            if (currentMode === "decomposition") {
                currentMode = "layout";
                initLayoutPrac();	
            } else {
                currentMode = "decomposition";
                initDecompPrac();					
            }
            saveSettings('mode', currentMode)
        });

        $.addEventListener('keydown', keydownEvent);
        $.addEventListener('keyup', keyupEvent);
    } else {
        const err_msg = `Network request failed with response ${request.status}: ${request.statusText}`
        alert(err_msg)
        console.log(err_msg);
    }
}
request.send();

function initLayoutPrac(){
    decompositionCursor.innerHTML = ''; // unprocessed

    testChar = array_rand(Object.keys(cangjieCodeTable));
    testCharCode = array_rand(cangjieCodeTable[testChar]) 
    testCharCodeLength = testCharCode.length;
    charBox.textContent = testChar;
    currentCodePos = 0;

    for (const k of enKeys) {
        let keyboardKey = $.getElementsByClassName(`keyboard__key-${k}`)[0];
        keyboardKey.classList.remove("keyboard__key--blink");
    }
    
    $.getElementsByClassName(`keyboard__key-${testCharCode[0]}`)[0].classList.add("keyboard__key--blink");

    for (let i = 0; i < testCharCodeLength; i++) {
        let decompositionCursorCharacter = $.createElement('span');

        decompositionCursorCharacter.className = "decomposition-cursor__character";
        
        if (!i) decompositionCursorCharacter.className += " decomposition-cursor__character--blink";
        decompositionCursorCharacter.textContent = keyToRadical[testCharCode[i]];
        decompositionCursor.appendChild(decompositionCursorCharacter);					
    }
}

function initDecompPrac() {
    decompositionCursor.innerHTML = ''; // unprocessed

    testChar = array_rand(Object.keys(cangjieCodeTable));
    testCharCode = array_rand(cangjieCodeTable[testChar]) 
    testCharCodeLength = testCharCode.length;
    charBox.textContent = testChar;
    currentCodePos = 0;
    
    for (let i = 0; i < testCharCodeLength; i++) {
        let decompositionCursorCharacter = $.createElement('span');
        decompositionCursorCharacter.className = "decomposition-cursor__character";
        decompositionCursor.appendChild(decompositionCursorCharacter);					
    }
}

function keydownEvent(e) {
    const keyname = (e.key).toLowerCase();
    console.log(keyname);

    if (currentMode === "layout") {
        if (keyname === ' ') {
            kbVisibility = (kbVisibility === 'visible') ? 'hidden' : 'visible'
            saveSettings('kb_visible', kbVisibility)
        }
        
        let keyboardKey = $.getElementsByClassName(`keyboard__key-${keyname}`)[0];
        if (keyboardKey) {
            let decompositionCursorCharacter = $.getElementsByClassName('decomposition-cursor__character')[currentCodePos];
            // console.log(decompositionCursorCharacter)
            if (keyname === testCharCode[currentCodePos]) {
                keyboardKey.classList.add("keyboard__key--activated-correct");
                // console.log("keyname === questCharacterCodes[questCharacterCodesPosition]")
                decompositionCursorCharacter.classList.remove("decomposition-cursor__character--blink");
                decompositionCursorCharacter.classList.add("decomposition-cursor__character--finished");
                if (currentMode === "decomposition") {
                    decompositionCursorCharacter.textContent = keyToRadical[keyname];
                }
                keyboardKey.classList.remove("keyboard__key--blink");

                currentCodePos++;

                if (currentCodePos == testCharCodeLength) {
                    initLayoutPrac();
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

            if(currentCodePos == testCharCodeLength){
                initDecompPrac();
            } 
        } else if (keyname === " ") {
            decompositionCursorCharacter.textContent = keyToRadical[testCharCode[currentCodePos]];
            if (!decompositionCursorCharacter.classList.contains("decomposition-cursor__character--hint"))
                decompositionCursorCharacter.classList.add("decomposition-cursor__character--hint");
        } else if (keyname === "enter") {
            const decompositionCharacterBar = $.getElementsByClassName("decomposition-cursor")[0]
            for (const [i, decompositionCharacter] of decompositionCharacterBar.childNodes.entries()) {
                // console.log(questCharacterCodes)
                if (!decompositionCharacter.classList.contains("decomposition-cursor__character--hint") && !decompositionCharacter.textContent) {
                    decompositionCharacter.textContent = keyToRadical[testCharCode[i]];
                    decompositionCharacter.classList.add("decomposition-cursor__character--hint");
                }
            }
        }
    }
}

function keyupEvent(e) {
    if (currentMode === "layout") {
        const keyname = (e.key).toLowerCase();

        let keyboardKey = $.getElementsByClassName(`keyboard__key-${keyname}`)[0];
        if (keyboardKey) {
            const key_classlist = keyboardKey.classList
            const key_activated_classnames = ["keyboard__key--activated-incorrect", "keyboard__key--activated-correct"]

            for (const activation_classname of key_activated_classnames) {
                if (key_classlist.contains(activation_classname)) {
                    key_classlist.remove(activation_classname)
                }
            }
        }
    }
}