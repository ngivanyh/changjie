let cangjieCodeTable; 
let questCharacter;
let questCharacterCodes;
let questCharacterCodesLength;
let questCharacterCodesPosition;

let currentTheme;
let currentMode;

const $ = document
let decompositionCursor = $.getElementsByClassName('decomposition-cursor')[0];
let charToType = $.getElementsByClassName('quest-frame__character')[0];

const keyToRadical = {"a":"日","b":"月","c":"金","d":"木","e":"水","f":"火","g":"土","h":"竹","i":"戈","j":"十","k":"大","l":"中","m":"一","n":"弓","o":"人","p":"心","q":"手","r":"口","s":"尸","t":"廿","u":"山","v":"女","w":"田","x":"難","y":"卜","z":"z",",":"，",".":"。",";":"；"};

const request = new XMLHttpRequest();
request.open('GET', './resources/cangjieCodeTable.min.json');
request.responseType = 'json';
request.onload = function(){
    if (this.status >= 200 && this.status < 400) {
        function saveSettings(k, v) {
            $.documentElement.setAttribute(k, v);
            localStorage.setItem(k, v);
        }
        cangjieCodeTable = request.response;

        currentTheme = window.matchMedia("(prefers-color-scheme: light)") ? 'light' : 'dark';
        saveSettings('theme', currentTheme)

        currentMode = localStorage.getItem('mode') ? localStorage.getItem('mode') : 'layout';
        saveSettings('mode', currentMode)

        if (currentMode === "decomposition") {
            initDecompPrac();					
        } else {
            initLayoutPrac();	
        }

        $.querySelector('#btn-darkmode--toggle').addEventListener('click', (e) => {
            // console.log('clicked!');
            currentTheme = (currentTheme === 'light') ? 'dark' : 'light'
            saveSettings('theme', currentTheme)
        });

        $.addEventListener('keydown', keydownEvent);
        $.addEventListener('keyup', keyupEvent);

        $.querySelector('#btn-practice-mode--toggle').addEventListener('click', (e) => {
            if (currentMode === "decomposition") {
                currentMode = "layout";
                initLayoutPrac();	
            } else {
                currentMode = "decomposition";
                initDecompPrac();					
            }
            saveSettings('mode', currentMode)
        });
    } else {
        const err_msg = `Network request failed with response ${request.status}: ${request.statusText}`
        alert(err_msg)
        console.log(err_msg);
    }
}
request.send();

function array_rand(arr){
    return arr[Math.floor(Math.random() * arr.length)];	
}

function initLayoutPrac(){
    decompositionCursor.innerHTML = ''; // unprocessed

    questCharacter = array_rand(Object.keys(cangjieCodeTable));
    questCharacterCodes = array_rand(cangjieCodeTable[questCharacter]) 
    questCharacterCodesLength = questCharacterCodes.length;
    charToType.textContent = questCharacter;
    questCharacterCodesPosition = 0;

    let keys = Object.keys(keyToRadical);
    for (let i = 0; i < keys.length; i++) {
        let keyboardKey = $.getElementsByClassName(`keyboard__key-${keys[i]}`)[0];
        keyboardKey.classList.remove("keyboard__key--blink");
    }
    
    $.getElementsByClassName(`keyboard__key-${questCharacterCodes[0]}`)[0].classList.add("keyboard__key--blink");

    // console.log(questCharacter, questCharacterCodes);	

    for (let i = 0; i < questCharacterCodesLength; i++) {
        let decompositionCursorCharacter = $.createElement('span');

        decompositionCursorCharacter.className = "decomposition-cursor__character";
        
        if (!i) decompositionCursorCharacter.className += " decomposition-cursor__character--blink";
        decompositionCursorCharacter.textContent = keyToRadical[questCharacterCodes[i]];
        decompositionCursor.appendChild(decompositionCursorCharacter);					
    }
}

function initDecompPrac() {
    decompositionCursor.innerHTML = ''; // unprocessed

    questCharacter = array_rand(Object.keys(cangjieCodeTable));
    questCharacterCodes = array_rand(cangjieCodeTable[questCharacter]) 
    questCharacterCodesLength = questCharacterCodes.length;
    charToType.textContent = questCharacter;
    questCharacterCodesPosition = 0;
    
    // console.log(questCharacter, questCharacterCodes);	

    for (let i = 0; i < questCharacterCodesLength; i++) {
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
            for (const k of Object.keys(keyToRadical)) {
                let k_html = $.getElementsByClassName(`keyboard__key-${k}`)[0]
                k_html.innerHTML = (k_html.innerHTML != '　') ? '　' : keyToRadical[k]
            }
        }
        let keyboardKey = $.getElementsByClassName(`keyboard__key-${keyname}`)[0];
        if (keyboardKey) {
            let decompositionCursorCharacter = $.getElementsByClassName('decomposition-cursor__character')[questCharacterCodesPosition];
            // console.log(decompositionCursorCharacter)
            if (keyname === questCharacterCodes[questCharacterCodesPosition]) {
                console.log('saa')
                keyboardKey.classList.add("keyboard__key--activated-correct");
                // console.log("keyname === questCharacterCodes[questCharacterCodesPosition]")
                decompositionCursorCharacter.classList.remove("decomposition-cursor__character--blink");
                decompositionCursorCharacter.classList.add("decomposition-cursor__character--finished");
                if (currentMode === "decomposition") {
                    decompositionCursorCharacter.textContent = keyToRadical[keyname];
                }
                keyboardKey.classList.remove("keyboard__key--blink");

                questCharacterCodesPosition++;

                if (questCharacterCodesPosition == questCharacterCodesLength) {
                    initLayoutPrac();
                } else {
                    decompositionCursorCharacter.nextElementSibling.classList.add("decomposition-cursor__character--blink");
                    
                    let keyboardNextKey = $.getElementsByClassName(`keyboard__key-${questCharacterCodes[questCharacterCodesPosition]}`)[0];
                    keyboardNextKey.classList.add("keyboard__key--blink");
                }
            } else {
                keyboardKey.classList.add("keyboard__key--activated-incorrect");
            }
        }
    } else {
        let decompositionCursorCharacter = $.getElementsByClassName('decomposition-cursor__character')[questCharacterCodesPosition];

        if(keyname ===  questCharacterCodes[questCharacterCodesPosition]){

            if(decompositionCursorCharacter.classList.contains("decomposition-cursor__character--hint"))
                decompositionCursorCharacter.classList.remove("decomposition-cursor__character--hint");

            decompositionCursorCharacter.textContent = keyToRadical[keyname];
            questCharacterCodesPosition++;

            if(questCharacterCodesPosition == questCharacterCodesLength){
                initDecompPrac();
            } 
        } else if (keyname === " ") {
            decompositionCursorCharacter.textContent = keyToRadical[questCharacterCodes[questCharacterCodesPosition]];
            if (!decompositionCursorCharacter.classList.contains("decomposition-cursor__character--hint"))
                decompositionCursorCharacter.classList.add("decomposition-cursor__character--hint");
        } else if (keyname === "enter") {
            const decompositionCharacterBar = $.getElementsByClassName("decomposition-cursor")[0]
            for (const [i, decompositionCharacter] of decompositionCharacterBar.childNodes.entries()) {
                // console.log(questCharacterCodes)
                if (!decompositionCharacter.classList.contains("decomposition-cursor__character--hint") && decompositionCharacter.textContent === '') {
                    decompositionCharacter.textContent = keyToRadical[questCharacterCodes[i]];
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
            key_classlist = keyboardKey.classList
            const key_activated_classnames = ["keyboard__key--activated-incorrect", "keyboard__key--activated-correct"]

            for (const activation_classname of key_activated_classnames) {
                if (key_classlist.contains(activation_classname)) {
                    key_classlist.remove(activation_classname)
                }
            }
        }
    }
}