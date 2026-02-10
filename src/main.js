/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

// imports
import { getCangjieCharacter, getCangjieCodes } from './js/codeTable.js';
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
    shakeBox,
    decomposedCharClasses,
    keyboardKeyClasses,
} from './js/helper.js';

// ui setup (event listeners)
document.querySelector('#theme-toggle').addEventListener('click', (e) => {
    if (e.button === 0) // cycle next when left click pressed
        userSettings.theme.next();
    else // cycle to previous when right click pressed
        userSettings.theme.prev();
});

document.querySelector('#kb-toggle').addEventListener('click', () => {
    userSettings.kbVisibility.next();
});

document.querySelector('#mode-toggle').addEventListener('click', () => {
    userSettings.mode.next();
    initPrac();
});

document.getElementsByName(`region-${userSettings.regionPreference.currentValue}`)[0].selected = true;

cangjieRegionSelection.addEventListener('change', () => {
    userSettings.regionPreference.next();
    initPrac();
    cangjieRegionSelection.blur(); // de-focus
});

// event listeners for the typing
if (deviceType === 'mobile') {
    // let users be able to get the digital keyboard out
    document.querySelector('main').addEventListener('click', () => {
        if (document.activeElement !== input) input.focus();
    });
    input.addEventListener('keydown', handleKeyInput);
    input.addEventListener('keyup', handleKeyRelease);
} else {
    document.addEventListener('keydown', handleKeyInput);
    document.addEventListener('keyup', handleKeyRelease);
}

// make keyboard keys clickable (using e.target.closest to save eventListeners)
const keyboard = document.querySelector('#keyboard');
keyboard.addEventListener('mousedown', handleKeyInput);
keyboard.addEventListener('mouseup', handleKeyRelease);
keyboard.addEventListener('touchstart', handleKeyInput);
keyboard.addEventListener('touchend', handleKeyRelease);

// event listener for decomposed character click in decomposition mode
document.querySelector('#decomposed-characters').addEventListener('click', decomposedCharacterClicked);

// start program
initPrac();

async function initPrac() {
    // resetting ui
    cangjieRegionSelection.disabled = true;
    document.querySelectorAll(keyboardKeyClasses.blink).forEach(key => key.classList.remove(keyboardKeyClasses.blink));

    const char = getCangjieCharacter();
    const charCode = getCangjieCodes();

    if (typeof(charCode) === 'object') { // char has regional differences
        cangjieRegionSelection.disabled = false; // re-enable selection
        appState.newTestCharacter(charCode[userSettings.regionPreferenceValue]);
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

        decompCursorChar.textContent = (userSettings.modeValue === 'layout') ? keyToRadicalTable[appState.testCharCode[i]] : '';
    }

    // hide unused decomposition cursor characters
    Array.from(decomposedChars).slice(appState.testCharCodeLength).forEach(
        unusedCursorChar => unusedCursorChar.style.display = 'none'
    );

    // set blinking key and decomposition cursor char
    if (userSettings.modeValue === 'layout') {
        kbKeys[appState.currentChar].classList.add(keyboardKeyClasses.blink);
        decomposedChars[0].classList.add(decomposedCharClasses.selected);
    }
}

function handleKeyInput(e) {
    let keyname;
    if (e.type === 'keydown') {
        keyname = (e.key).toLowerCase();
    } else {
        const clickedKey = e.target.closest('.keyboard-key');
        if (!clickedKey) return;
        keyname = clickedKey.id.slice(-1);
    }

    // offload event handling to separate functions
    const out = (userSettings.modeValue === 'layout') ? layoutHandleInput(keyname) : decompositionHandleInput(keyname);

    if (out) return; // handler prematurely returned

    // check if we need to move on
    if (!appState.incrementCodePosition()) // this check also implicitly increments the state
        initPrac();
    else if (userSettings.modeValue === 'layout') {
        appState.currentDecomposedChar.classList.add(decomposedCharClasses.selected);
        kbKeys[appState.currentChar].classList.add(keyboardKeyClasses.blink);
    }

}

function layoutHandleInput(keyname = '') {
    // special circumstances (keystrokes) for space and meta
    if (keyname === ' ') {
        userSettings.kbVisibility.next();
        return 1;
    }

    if (keyname === 'meta') {
        appState.metaState.setByValue(true);
        return 1;
    }

    if (appState.metaStateValue) {
        shakeBox();
        return 1;
    }

    const keyboardKey = kbKeys[keyname];

    if (!keyboardKey) return 1;

    if (keyname !== appState.currentChar){
        keyboardKey.classList.add(keyboardKeyClasses.activated.incorrect);
        return 1;
    }

    // user typed correct key
    keyboardKey.classList.add(keyboardKeyClasses.activated.correct);
    appState.currentDecomposedChar.classList.remove(decomposedCharClasses.selected);
    appState.currentDecomposedChar.classList.add(decomposedCharClasses.faded);
    keyboardKey.classList.remove(keyboardKeyClasses.blink);

    return 0;
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

        return 1;
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

        return 1;
    }

    if (keyname !== appState.currentChar) {
        shakeBox();
        return 1;
    }

    // user typed correct key
    appState.currentDecomposedChar.classList.remove(decomposedCharClasses.faded);
    appState.currentDecomposedChar.textContent = keyToRadicalTable[keyname];

    return 0;
}

function decomposedCharacterClicked(e) {
    const decomposedCharToBeClicked = e.target.closest('.decomposed-character');

    if (!decomposedCharToBeClicked || userSettings.modeValue !== 'decomposition')
        return;

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
        appState.metaState.setByValue(false); // reset value to false
        return;
    }

    if (kbKeys[keyname]) {
        kbKeys[keyname].classList.remove(
            keyboardKeyClasses.activated.correct,
            keyboardKeyClasses.activated.incorrect
        );
    }

    // resetting input box value
    if (deviceType === 'mobile') input.value = '';
}