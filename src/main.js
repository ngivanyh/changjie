/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

// imports
import appState from './js/state.js';
import userSettings from './js/settings.js';
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
} from './js/helper.js';

// program related data
let cangjieCodeTable = JSON.parse(localStorage.getItem('cangjieCodeTable')) || {};
let practicedIndex = saveSettings('practiced_index', Number(localStorage.getItem('practiced_index')) || 0, false);

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
    userSettings.regionPreference.save();
    initPrac();
    cangjieRegionSelection.blur(); // de-focus
});

// event listeners for the typing
if (deviceType === 'mobile') {
    document.querySelector('main').addEventListener('click', () => {
        if (document.activeElement !== input) input.focus();
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
document.querySelector('#decomposed-characters').addEventListener('click', decomposedCharacterClicked);

// start program
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
            if (!data || typeof(data) !== 'object') {
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

            for (const k of data_keys) cangjieCodeTable[k] = data.data[k];

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
        appState.newTestCharacter(charCode[userSettings.regionPreference.currentValue]);
    } else {
        appState.newTestCharacter(charCode);
    }

    charBox.textContent = char;
    charBox.href = `https://www.hkcards.com/cj/cj-char-${char}.html`;

    // decomposition cursor character generation
    for (const [i, decompCursorChar] of Object.entries(decomposedChars)) {
        decompCursorChar.style.display = 'inline-block';
        decompCursorChar.classList.remove(
            decomposedCharClasses.faded,
            decomposedCharClasses.selected
        );

        decompCursorChar.textContent = (userSettings.mode.currentValue === 'layout') ? keyToRadicalTable[appState.testCharCode[i]] : '';
    }

    // hide unused decomposition cursor characters
    Array.from(decomposedChars).slice(appState.testCharCodeLength).forEach(
        unusedCursorChar => unusedCursorChar.style.display = 'none'
    );

    // set blinking key and decomposition cursor char
    if (userSettings.mode.currentValue === 'layout') {
        kbKeys[appState.currentChar].classList.add(keyboardKeyClasses.blink);
        decomposedChars[0].classList.add(decomposedCharClasses.selected);
    }
}

function nextCharacter() {
    practicedIndex = saveSettings('practiced_index', practicedIndex + 1, false);
    initPrac();
}

function handleKeyInput(e) {
    const keyname = (e.type === 'keydown') ? (e.key).toLowerCase() : e.target.id.slice(-1);

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
        appState.metaState = true;
        return;
    }

    if (appState.metaState) {
        shake_box();
        return;
    }

    const keyboardKey = kbKeys[keyname];

    if (!keyboardKey)
        return;

    if (keyname !== appState.currentChar){
        keyboardKey.classList.add(keyboardKeyClasses.activated.incorrect);
        return;
    }

    // user typed correct key
    keyboardKey.classList.add(keyboardKeyClasses.activated.correct);
    appState.currentDecomposedChar.classList.remove(decomposedCharClasses.selected);
    appState.currentDecomposedChar.classList.add(decomposedCharClasses.faded);
    keyboardKey.classList.remove(keyboardKeyClasses.blink);

    if (!appState.incrementCodePosition())
        nextCharacter();
    else {
        appState.currentDecomposedChar.classList.add(decomposedCharClasses.selected);
        kbKeys[appState.currentChar].classList.add(keyboardKeyClasses.blink);
    }
}

function decompositionHandleInput(keyname = '') {
    // special circumstances (keystrokes) for space and enter
    if (keyname === ' ') {
        if (
            !appState.currentDecomposedChar.classList.contains(decomposedCharClasses.faded)
            && !appState.currentDecomposedChar.textContent
        ) {
            appState.currentDecomposedChar.textContent = keyToRadicalTable[appState.currentChar];
            appState.currentDecomposedChar.classList.add(decomposedCharClasses.faded);
        }

        return;
    }

    if (keyname === 'enter') {
        for (const [i, decomposedChar] of Object.entries(decomposedChars)) {
            if (
                decomposedChar.classList.contains(decomposedCharClasses.faded)
                || decomposedChar.textContent
            ) continue;
            decomposedChar.textContent = keyToRadicalTable[appState.testCharCode[i]]; // js is weird
            decomposedChar.classList.add(decomposedCharClasses.faded);
        }

        return;
    }

    if (keyname !== appState.currentChar) {
        shake_box();
        return;
    }

    // user typed correct key
    appState.currentDecomposedChar.classList.remove(decomposedCharClasses.faded);
    appState.currentDecomposedChar.textContent = keyToRadicalTable[keyname];

    if (!appState.incrementCodePosition()) nextCharacter();
}

function decomposedCharacterClicked(e) {
    if (userSettings.mode.currentValue !== 'decomposition')
        return;

    const decomposedCharToBeClicked = e.target.closest('.decomposed-character');
    if (!decomposedCharToBeClicked) return;

    const characterIndex = Number(decomposedCharToBeClicked.id.slice(-1)) - 1;
    const decomposedChar = decomposedChars[characterIndex];

    if (
        !decomposedChar.classList.contains(decomposedCharClasses.faded)
        && !decomposedChar.textContent
    ) {
        decomposedChar.textContent = keyToRadicalTable[appState.testCharCode[characterIndex]];
        decomposedChar.classList.add(decomposedCharClasses.faded);
    }
}

function handleKeyRelease(e) {
    if (userSettings.mode.currentValue !== 'layout')
        return;

    const keyname = (e.type === 'keyup') ? (e.key).toLowerCase() : e.target.id.slice(-1);

    if (keyname === 'meta') {
        appState.metaState = false; // reset value to false
        return;
    }

    if (kbKeys[keyname])
        kbKeys[keyname].classList.remove(
            keyboardKeyClasses.activated.correct,
            keyboardKeyClasses.activated.incorrect
        );

    // resetting input box value
    if (deviceType === 'mobile') input.value = '';
}