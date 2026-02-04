/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

import appState from "./state.js";
import { reportErr, queries } from "./helper.js";

// cache api
const changjieCache = await caches.open('ChangjieCache');
const cachedCangjieCodes = await changjieCache.match(queries.codes);

const cangjieCodes = (!cachedCangjieCodes) ? await getCodeTable() : await cachedCangjieCodes.json();

console.log('Cangjie codes:', cangjieCodes);

async function getCodeTable() {
    let response;
    try {
        response = await fetch(queries.codes);
    } catch (error) {
        reportErr(`Failed to fetch Cangjie code table: ${error}`);
    }

    if (!response.ok)
        reportErr(`Request to fetch Cangjie code table failed with status ${response.status}: ${response.statusText}`);

    let data;
    if (response.headers.get('Content-Encoding') === 'gzip') {
        data = await response.json();
    } else {
        const ds = new DecompressionStream('gzip');
        data = await new Response(response.body.pipeThrough(ds)).json();
    }

    if (!data || typeof (data) !== 'object')
        reportErr(`Expected Cangjie code table response datatype: object, got ${typeof(data)}`);

    let scrambledCangjieCodes = {};

    const dataKeys = Object.keys(data);

    // Fisher-Yates-Durstenfeld Shuffle
    for (let i = 0; i < dataKeys.length - 1; i++) {
        const j = i + Math.floor(Math.random() * (dataKeys.length - i));
        [dataKeys[i], dataKeys[j]] = [dataKeys[j], dataKeys[i]];
    }

    for (const k of dataKeys) scrambledCangjieCodes[k] = data[k];

    await changjieCache.put(
        queries.codes,
        new Response(
            JSON.stringify(scrambledCangjieCodes),
            { 'headers': { 'Content-Type': 'application/json' } }
        )
    );

    return scrambledCangjieCodes;
}

export const getCangjieCharacter = () => {
    return Object.keys(cangjieCodes)[appState.practiceIndex];
}

export const getCangjieCodes = () => {
    return Object.values(cangjieCodes)[appState.practiceIndex];
}