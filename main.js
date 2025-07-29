let cangjieCodeTable; 
let questCharacter;
let questCharacterCodes;
let questCharacterCodesLength;
let questCharacterCodesPosition;

let currentTheme;
let currentMode;

let decompositionCursor = document.getElementsByClassName('decomposition-cursor')[0];
let questFrameCharacter = document.getElementsByClassName('quest-frame__character')[0];

const key2RadicalTable = {"a":"日","b":"月","c":"金","d":"木","e":"水","f":"火","g":"土","h":"竹","i":"戈","j":"十","k":"大","l":"中","m":"一","n":"弓","o":"人","p":"心","q":"手","r":"口","s":"尸","t":"廿","u":"山","v":"女","w":"田","x":"難","y":"卜"};

window.addEventListener('load', function(){
    let request = new XMLHttpRequest();
    request.open('GET', 'cangjieCodeTable.min.json');
    request.responseType = 'json';
    request.onload = function(){
        if (this.status >= 200 && this.status < 400) {
            cangjieCodeTable = request.response;

            // init
            initTheme();
            initMode();
        } else {
            alert(`Network request failed with response ${request.status}: ${request.statusText}`)
            console.log(`Network request failed with response ${request.status}: ${request.statusText}`);
        }
    }
    request.send();
});

function initTheme() {
    currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);

    const btnDarkmode = document.getElementsByClassName('btn-darkmode--toggle')[0];  
    btnDarkmode.addEventListener('click', (e) => {
        // console.log('clicked!');
        if (currentTheme === 'light')
            currentTheme = 'dark' 
        else 
            currentTheme = 'light'; 
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
    });
}

function initMode() {
    currentMode = localStorage.getItem('mode') ? localStorage.getItem('mode') : 'layout';
    document.documentElement.setAttribute('practice-mode', currentMode);
    localStorage.setItem('mode', currentMode);

    if (currentMode === "decomposition")
        decompositionMode_generateQuest();
    else 
        generateQuest();

    document.addEventListener('keydown', keydownEvent);
    document.addEventListener('keyup', keyupEvent);

    const btnPracticeMode = document.getElementsByClassName('btn-practice-mode--toggle')[0];  

    btnPracticeMode.addEventListener('click', (e) => {
        if (currentMode === "decomposition") {
            currentMode = "layout";
            generateQuest();	
        } else {
            currentMode = "decomposition";
            decompositionMode_generateQuest();					
        }
        document.documentElement.setAttribute('practice-mode', currentMode);
        localStorage.setItem('mode', currentMode);
    });
}

function array_rand(arr){
    return arr[Math.floor(Math.random() * arr.length)];	
}

function generateQuest(){
    decompositionCursor.innerHTML = ''; // unprocessed

    questCharacter = array_rand(Object.keys(cangjieCodeTable));
    questCharacterCodes = array_rand(cangjieCodeTable[questCharacter]) 
    questCharacterCodesLength = questCharacterCodes.length;
    questFrameCharacter.textContent = questCharacter;
    questCharacterCodesPosition = 0;

    let keys = Object.keys(key2RadicalTable);
    for (let i = 0; i < keys.length; i++) {
        keyboardKey = document.getElementsByClassName(`keyboard__key-${keys[i]}`)[0];
        keyboardKey.classList.remove("keyboard__key--blink");
    }
    
    document.getElementsByClassName(`keyboard__key-${questCharacterCodes[0]}`)[0].classList.add("keyboard__key--blink");

    console.log(questCharacter, questCharacterCodes);	

    for (let i = 0; i < questCharacterCodesLength; i++) {
        let decompositionCursorCharacter = document.createElement('span');

        decompositionCursorCharacter.className = "decomposition-cursor__character";
        
        if (!i) decompositionCursorCharacter.className += " decomposition-cursor__character--blink";
        decompositionCursorCharacter.textContent = key2RadicalTable[questCharacterCodes[i]];
        decompositionCursor.appendChild(decompositionCursorCharacter);					
    }
    
}

function decompositionMode_generateQuest() {
    decompositionCursor.innerHTML = ''; // unprocessed

    questCharacter = array_rand(Object.keys(cangjieCodeTable));
    questCharacterCodes = array_rand(cangjieCodeTable[questCharacter]) 
    questCharacterCodesLength = questCharacterCodes.length;
    questFrameCharacter.textContent = questCharacter;
    questCharacterCodesPosition = 0;
    
    console.log(questCharacter, questCharacterCodes);	

    for (let i = 0; i < questCharacterCodesLength; i++) {
        let decompositionCursorCharacter = document.createElement('span');
        decompositionCursorCharacter.className = "decomposition-cursor__character";
        decompositionCursor.appendChild(decompositionCursorCharacter);					
    }
}

function keydownEvent(e) {
    if (currentMode === "layout") {
        const keyname = (e.key).toLowerCase();
        console.log(keyname);

        let keyboardKey = document.getElementsByClassName(`keyboard__key-${keyname}`)[0];
        if (keyboardKey) {
            let decompositionCursorCharacter = document.getElementsByClassName('decomposition-cursor__character')[questCharacterCodesPosition];
            // console.log(decompositionCursorCharacter)
            if (keyname ===  questCharacterCodes[questCharacterCodesPosition]) {
                keyboardKey.classList.add("keyboard__key--activated-correct");
                console.log("keyname === questCharacterCodes[questCharacterCodesPosition]")
                decompositionCursorCharacter.classList.remove("decomposition-cursor__character--blink");
                decompositionCursorCharacter.classList.add("decomposition-cursor__character--finished");
                if (currentMode === "decomposition") {
                    decompositionCursorCharacter.textContent = key2RadicalTable[keyname];
                }
                keyboardKey.classList.remove("keyboard__key--blink");

                questCharacterCodesPosition++;

                if (questCharacterCodesPosition == questCharacterCodesLength) {
                    generateQuest();
                } else {
                    decompositionCursorCharacter.nextElementSibling.classList.add("decomposition-cursor__character--blink");
                    
                    let keyboardNextKey = document.getElementsByClassName(`keyboard__key-${questCharacterCodes[questCharacterCodesPosition]}`)[0];
                    keyboardNextKey.classList.add("keyboard__key--blink");
                }
            } else {
                keyboardKey.classList.add("keyboard__key--activated-incorrect");
            }
        }
    } else {
        const keyname = (e.key).toLowerCase();

        let decompositionCursorCharacter = document.getElementsByClassName('decomposition-cursor__character')[questCharacterCodesPosition];

        if(keyname ===  questCharacterCodes[questCharacterCodesPosition]){

            if(decompositionCursorCharacter.classList.contains("decomposition-cursor__character--hint"))
                decompositionCursorCharacter.classList.remove("decomposition-cursor__character--hint");

            decompositionCursorCharacter.textContent = key2RadicalTable[keyname];
            questCharacterCodesPosition++;

            if(questCharacterCodesPosition == questCharacterCodesLength){
                decompositionMode_generateQuest();
            } 
        } else if (keyname === " ") {
            decompositionCursorCharacter.textContent = key2RadicalTable[questCharacterCodes[questCharacterCodesPosition]];
            if (!decompositionCursorCharacter.classList.contains("decomposition-cursor__character--hint"))
                decompositionCursorCharacter.classList.add("decomposition-cursor__character--hint");
        } else if (keyname === "enter") {
            const decompositionCharacterBar = document.getElementsByClassName("decomposition-cursor")[0]
            for (const [i, decompositionCharacter] of decompositionCharacterBar.childNodes.entries()) {
                // console.log(questCharacterCodes)
                if (!decompositionCharacter.classList.contains("decomposition-cursor__character--hint") && decompositionCharacter.textContent === '') {
                    decompositionCharacter.textContent = key2RadicalTable[questCharacterCodes[i]];
                    decompositionCharacter.classList.add("decomposition-cursor__character--hint");
                }
            }
        }
    }
}

function keyupEvent(e) {
    if (currentMode === "layout") {
        const keyname = (e.key).toLowerCase();

        let keyboardKey = document.getElementsByClassName(`keyboard__key-${keyname}`)[0];
        if (keyboardKey) {
            if (keyboardKey.classList.contains("keyboard__key--activated-correct")) {
                keyboardKey.classList.remove("keyboard__key--activated-correct");
            } 
            if (keyboardKey.classList.contains("keyboard__key--activated-incorrect")){
                keyboardKey.classList.remove("keyboard__key--activated-incorrect");
            }
        }
    }
}
