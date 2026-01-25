/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

// imports
import userSettings from './settings.js';
import {
    input,
    kbKeys,
    charBox,
    deviceType,
    decomposedChars,
    keyToRadicalTable,
    cangjieRegionSelection,
    saveSettings,
    shake_box,
    reportErr,
    decomposedCharClasses,
    keyboardKeyClasses
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

let pressedMeta = false;

// ui setup
document.querySelector('#theme-toggle').addEventListener('click', () => {
    userSettings.theme.next();
    userSettings.theme.save();
});

document.querySelector('#kb-toggle').addEventListener('click', () => {
    userSettings.kbVisibility.next();
    userSettings.kbVisibility.save();
});

document.querySelector('#mode-toggle').addEventListener('click', () => {
    userSettings.mode.next();
    userSettings.mode.save();
    initPrac();
});

document.getElementsByName(`region-${userSettings.regionPreference.currentValue}`)[0].selected = true;

cangjieRegionSelection.addEventListener('change', () => {
    userSettings.regionPreference.next();
    userSettings.regionPreference.save(userSettings.regionPreference.savedAs, false);
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

// event listener for decomposed character click in decomposition mode
document.addEventListener('click', decomposedCharacterClicked);

// init
initPrac();

async function retrieveCodeTable() {
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
                const err_msg = `A network error occurred, the request to fetch a certain program resource has failed with ${response.status}: ${response.statusText}.`;
                reportErr(err_msg);
                throw new Error(err_msg);
            }

            if (response.headers.get('Content-Encoding') === 'gzip')
                return response.json();

            const ds = new DecompressionStream('gzip');
            return new Response(response.body.pipeThrough(ds)).json();
        })
        .then(data => {
            if (!data || typeof(data) != 'object') {
                const err_msg = 'An error occurred whilst processing a certain program resource.';
                reportErr(err_msg);
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
    document.querySelectorAll(keyboardKeyClasses.blink).forEach(key => key.classList.remove(keyboardKeyClasses.blink));

    let char = Object.keys(cangjieCodeTable)[practicedIndex];

    if (!char) { // char is undefined, should be because cangjieCodeTable has no data
        await retrieveCodeTable();
        char = Object.keys(cangjieCodeTable)[practicedIndex];
    }

    const charCode = cangjieCodeTable[char];

    if (typeof(charCode) === 'object') { // char has regional differences
        cangjieRegionSelection.disabled = false; // re-enable selection
        testCharCode = charCode[userSettings.regionPreference.currentValue];
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
            decomposedCharClasses.grayed,
            decomposedCharClasses.selected
        );

        decompCursorChar.textContent = (userSettings.mode.currentValue === 'layout') ? keyToRadicalTable[testCharCode[i]] : '';
    }
    // hide unused decomposition cursor characters
    Array.from(decomposedChars).slice(testCharCodeLength).forEach(
        unused_cursor_char => unused_cursor_char.style.display = 'none'
    );

    // set blinking key and decomposition cursor char
    if (userSettings.mode.currentValue === 'layout') {
        kbKeys[currentCodeChar].classList.add(keyboardKeyClasses.blink);
        decomposedChars[0].classList.add(decomposedCharClasses.selected);
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
    if (userSettings.mode.currentValue === 'layout')
        layoutHandleInput(keyname);
    else
        decompositionHandleInput(keyname);
}

function layoutHandleInput(keyname = '') {
    // special circumstances (keystrokes) for space and meta
    if (keyname === ' ') {
        userSettings.kbVisibility.next();
        userSettings.kbVisibility.save();
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
        keyboardKey.classList.add(keyboardKeyClasses.activated.incorrect);
        return;
    }

    // user typed correct key
    keyboardKey.classList.add(keyboardKeyClasses.activated.correct);

    currentDecomposedChar.classList.remove(decomposedCharClasses.selected);
    currentDecomposedChar.classList.add(decomposedCharClasses.grayed);
    keyboardKey.classList.remove(keyboardKeyClasses.blink);

    currentCodePos++;
    currentCodeChar = testCharCode[currentCodePos];

    if (currentCodePos === testCharCodeLength)
        nextCharacter()
    else {
        currentDecomposedChar.nextElementSibling.classList.add(decomposedCharClasses.selected);
        kbKeys[currentCodeChar].classList.add(keyboardKeyClasses.blink);
    }
}

function decompositionHandleInput(keyname = '') {
    // special circumstances (keystrokes) for space and enter
    if (keyname === ' ') {
        if (
            !currentDecomposedChar.classList.contains(decomposedCharClasses.grayed)
            && !currentDecomposedChar.textContent
        ) {
            currentDecomposedChar.textContent = keyToRadicalTable[currentCodeChar]; // js is weird
            currentDecomposedChar.classList.add(decomposedCharClasses.grayed);
        }

        return;
    }

    if (keyname === 'enter') {
        for (const [i, decomposedChar] of Object.entries(decomposedChars)) {
            if (
                decomposedChar.classList.contains(decomposedCharClasses.grayed)
                || decomposedChar.textContent
            ) continue;
            decomposedChar.textContent = keyToRadicalTable[testCharCode[i]]; // js is weird
            decomposedChar.classList.add(decomposedCharClasses.grayed);
        }

        return;
    }

    if (keyname != currentCodeChar){
        shake_box();
        return;
    }

    // user typed correct key
    currentDecomposedChar.classList.remove(decomposedCharClasses.grayed);

    currentDecomposedChar.textContent = keyToRadicalTable[keyname];
    currentCodePos++;
    currentCodeChar = testCharCode[currentCodePos];

    if (currentCodePos === testCharCodeLength)
        nextCharacter()
}

function decomposedCharacterClicked(e) {
    if (userSettings.mode.currentValue != 'decomposition')
        return;

    const decomposedCharToBeClicked = e.target.closest('.decomposed-character');
    if (!decomposedCharToBeClicked)
        return;

    const characterIndex = Number(decomposedCharToBeClicked.id.slice(-1)) - 1;
    const decomposedChar = decomposedChars[characterIndex];

    if (
        !decomposedChar.classList.contains(decomposedCharClasses.grayed)
        && !decomposedChar.textContent
    ) {
        decomposedChar.textContent = keyToRadicalTable[testCharCode[characterIndex]];
        decomposedChar.classList.add(decomposedCharClasses.grayed);
    }
}

function handleKeyRelease(e) {
    if (userSettings.mode.currentValue != 'layout')
        return;

    const keyname = (e.type === 'keyup') ? (e.key).toLowerCase() : e.target.id.slice(-1);

    if (keyname === 'meta') {
        pressedMeta = false;
        return;
    }

    if (kbKeys[keyname])
        kbKeys[keyname].classList.remove(Object.values(keyboardKeyClasses.activated));

    // resetting input box value
    if (deviceType === 'mobile') input.value = '';
}