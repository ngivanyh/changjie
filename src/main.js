/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

// imports
import {
    input,
    kbKeys,
    charBox,
    deviceType,
    decomposedChars,
    keyToRadicalTable,
    preferredColorScheme,
    cangjieRegionSelection,
    saveSettings,
    shake_box
} from './helper.js';

// program related data
let cangjieCodeTable = JSON.parse(localStorage.getItem('cangjieCodeTable')) || {};
let practicedIndex = saveSettings('practiced_index', Number(localStorage.getItem('practiced_index')) || 0, false);

// state variables
let testCharCode;
let testCharCodeLength;
let currentCodePos;
let currentCodeChar;
let currentDecomposedChar;

// settings
let regionPreference = saveSettings('region_preference', localStorage.getItem('region_preference') || 'hk', false);
let currentTheme = saveSettings('theme', localStorage.getItem('theme') || preferredColorScheme);
let currentMode = saveSettings('mode', localStorage.getItem('mode') || 'layout');
let kbVisibility = saveSettings('kb_visible', localStorage.getItem('kb_visible') || 'visible');

let pressedMeta = false;

// ui setup
document.querySelector('#theme-toggle').addEventListener('click', () => {
    currentTheme = (currentTheme === 'light') ? saveSettings('theme', 'dark') : saveSettings('theme', 'light');
});

document.querySelector('#kb-toggle').addEventListener('click', () => {
    kbVisibility = (kbVisibility === 'visible') ? saveSettings('kb_visible', 'hidden') : saveSettings('kb_visible', 'visible');
});

document.querySelector('#mode-toggle').addEventListener('click', () => {
    currentMode = (currentMode === 'decomposition') ? saveSettings('mode', 'layout') : saveSettings('mode', 'decomposition');
    initPrac();
});

document.getElementsByName(`region-${regionPreference}`)[0].selected = true;

cangjieRegionSelection.addEventListener('change', (event) => {
    regionPreference = saveSettings('region_preference', event.target.value, false);
    initPrac();
    cangjieRegionSelection.blur(); // de-focus
});

// event listeners for the typing
if (deviceType === 'mobile') {
    document.querySelector('main').addEventListener('click', () => {
        if (document.activeElement != input) input.focus();
    });
    input.addEventListener('keydown', handleKeyInput);
    input.addEventListener('keyup', handleKeyRelease);
} else {
    document.addEventListener('keydown', handleKeyInput);
    document.addEventListener('keyup', handleKeyRelease);
}

// make keyboard keys clickable
document.querySelectorAll('.keyboard-key').forEach(keyboardKey => {
    keyboardKey.addEventListener('mousedown', handleKeyInput);
    keyboardKey.addEventListener('mouseup', handleKeyRelease);
    keyboardKey.addEventListener('touchstart', handleKeyInput);
    keyboardKey.addEventListener('touchend', handleKeyRelease);
});

for (const decomposedChar of decomposedChars)
    decomposedChar.addEventListener('click', decomposedCharacterClicked);

// init
initPrac();

async function retrieveCodeTable() {
    const reportErr = (err_msg) => {
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
                reportErr(`A network error occurred, the request to fetch a certain program resource has failed with ${response.status}: ${response.statusText}.`);
                throw new Error(err_msg);
            }

            if (response.headers.get('Content-Encoding') === 'gzip')
                return response.json();

            const ds = new DecompressionStream('gzip');
            return new Response(response.body.pipeThrough(ds)).json();
        })
        .then(data => {
            if (!data || typeof(data) != 'object') {
                reportErr('An error occurred whilst processing a certain program resource.');
                throw new Error(err_msg);
            }
            
            cangjieCodeTable = {};

            const data_keys = Object.keys(data.data);

            // Fisher-Yates-Durstenfeld Shuffle
            for (let i = 0; i < data_keys.length - 1; i++) {
                const j = i + Math.floor(Math.random() * (data_keys.length - i));

                [data_keys[i], data_keys[j]] = [data_keys[j], data_keys[i]];
            }

            for (const k of data_keys)
                cangjieCodeTable[k] = data.data[k];

            localStorage.setItem('cangjieCodeTable', JSON.stringify(cangjieCodeTable));
            localStorage.setItem('segment_details', JSON.stringify(data.details));
        });
    
    // reset practiced index back to the starting point
    practicedIndex = saveSettings('practiced_index', 0, false);
}

async function initPrac() {
    // resetting ui
    cangjieRegionSelection.disabled = true;
    document.querySelectorAll('.keyboard-key-blink').forEach(key => key.classList.remove('keyboard-key-blink'));

    let char = Object.keys(cangjieCodeTable)[practicedIndex];

    if (!char) { // char is undefined, should be because cangjieCodeTable has no data
        await retrieveCodeTable();
        char = Object.keys(cangjieCodeTable)[practicedIndex];
    }

    const charCode = cangjieCodeTable[char];

    if (typeof(charCode) === 'object') { // char has regional differences
        cangjieRegionSelection.disabled = false; // re-enable selection
        testCharCode = charCode[regionPreference];
    } else {
        testCharCode = charCode;
    }

    testCharCodeLength = testCharCode.length;
    charBox.textContent = char;
    charBox.href = `https://www.hkcards.com/cj/cj-char-${char}.html`;
    currentCodePos = 0;
    currentCodeChar = testCharCode[currentCodePos];

    // decomposition cursor character generation
    for (const [i, decompCursorChar] of Object.entries(decomposedChars)) {
        decompCursorChar.style.display = 'inline-block';
        decompCursorChar.classList.remove(
            'decomposed-character-grayed', 
            'decomposed-character-selected'
        );

        decompCursorChar.textContent = (currentMode === 'layout') ? keyToRadicalTable[testCharCode[i]] : '';
    }
    // hide unused decomposition cursor characters
    Array.from(decomposedChars).slice(testCharCodeLength).forEach(
        unused_cursor_char => unused_cursor_char.style.display = 'none'
    );

    // set blinking key and decomposition cursor char
    if (currentMode === 'layout') {
        kbKeys[currentCodeChar].classList.add('keyboard-key-blink');
        decomposedChars[0].classList.add('decomposed-character-selected');
    }
}

function nextCharacter() {
    practicedIndex = saveSettings('practiced_index', practicedIndex + 1, false);
    initPrac();
}

function handleKeyInput(e) {
    const keyname = (e.type === 'keydown') ? (e.key).toLowerCase() : e.target.id.slice(-1);

    currentDecomposedChar = decomposedChars[currentCodePos];

    // offload event handling to separate functions
    if (currentMode === 'layout')
        layoutHandleInput(keyname);
    else
        decompositionHandleInput(keyname);
}

function layoutHandleInput(keyname = '') {
    // special circumstances (keystrokes) for space and meta
    if (keyname === ' ') {
        kbVisibility = (kbVisibility === 'visible') ? saveSettings('kb_visible', 'hidden') : saveSettings('kb_visible', 'visible');
        return;
    }

    if (keyname === 'meta') {
        pressedMeta = true;
        return;
    }
    if (pressedMeta) {
        shake_box();
        return;
    }
    
    const keyboardKey = kbKeys[keyname];

    if (!keyboardKey || pressedMeta)
        return;

    if (keyname != currentCodeChar){
        keyboardKey.classList.add('keyboard-key-activated-incorrect');
        return;
    }
    
    // user typed correct key
    keyboardKey.classList.add('keyboard-key-activated-correct');

    currentDecomposedChar.classList.remove('decomposed-character-selected');
    currentDecomposedChar.classList.add('decomposed-character-grayed');
    keyboardKey.classList.remove('keyboard-key-blink');

    currentCodePos++;
    currentCodeChar = testCharCode[currentCodePos];

    if (currentCodePos === testCharCodeLength)
        nextCharacter()
    else {
        currentDecomposedChar.nextElementSibling.classList.add('decomposed-character-selected');
        kbKeys[currentCodeChar].classList.add('keyboard-key-blink');
    }
}

function decompositionHandleInput(keyname = '') {
    // special circumstances (keystrokes) for space and enter
    if (keyname === ' ') {
        if (
            !currentDecomposedChar.classList.contains('decomposed-character-grayed')
            && !currentDecomposedChar.textContent
        ) {
            currentDecomposedChar.textContent = keyToRadicalTable[currentCodeChar]; // js is weird
            currentDecomposedChar.classList.add('decomposed-character-grayed');
        }

        return;
    }

    if (keyname === 'enter') {
        for (const [i, decomposedChar] of Object.entries(decomposedChars)) {
            if (
                decomposedChar.classList.contains('decomposed-character-grayed')
                || decomposedChar.textContent
            ) continue;
            decomposedChar.textContent = keyToRadicalTable[testCharCode[i]]; // js is weird
            decomposedChar.classList.add('decomposed-character-grayed');
        }

        return;
    }

    if (keyname != currentCodeChar)
        return;

    // user typed correct key
    currentDecomposedChar.classList.remove('decomposed-character-grayed');

    currentDecomposedChar.textContent = keyToRadicalTable[keyname];
    currentCodePos++;
    currentCodeChar = testCharCode[currentCodePos];

    if (currentCodePos === testCharCodeLength)
        nextCharacter()
}

function decomposedCharacterClicked(e) {
    if (currentMode != 'decomposition')
        return;

    const characterIndex = Number(e.originalTarget.id.slice(-1)) - 1;
    const decomposedChar = decomposedChars[characterIndex];

    if (
        !decomposedChar.classList.contains('decomposed-character-grayed')
        && !decomposedChar.textContent
    ) {
        decomposedChar.textContent = keyToRadicalTable[testCharCode[characterIndex]];
        decomposedChar.classList.add('decomposed-character-grayed');
    }
}

function handleKeyRelease(e) {
    if (currentMode != 'layout')
        return;
    
    const keyname = (e.type === 'keyup') ? (e.key).toLowerCase() : e.target.id.slice(-1);

    if (keyname === 'meta') {
        pressedMeta = false;
        return;
    }

    if (kbKeys[keyname]) {
        kbKeys[keyname].classList.remove(
            'keyboard-key-activated-correct', 
            'keyboard-key-activated-incorrect'
        );
    }

    // resetting input box value
    if (deviceType === 'mobile') input.value = '';
}