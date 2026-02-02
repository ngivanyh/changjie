import appState from "./state.js";
import { reportErr } from "./helper.js";

export let cangjieCodeTable = JSON.parse(localStorage.getItem('cangjieCodeTable')) || {};

export async function retrieveCodeTable() {
    const segmentDetails = localStorage.getItem('segment_details');

    // default fetch id and index (will be used when there is no previous record of a code table)
    const fetch_id = (segmentDetails) ? (JSON.parse(segmentDetails)['segment-index'] + 1) % 5 : 0;

    // root is set to src and public is set to ../pubic so a direct path used
    const baseURL = import.meta.env.BASE_URL;
    await fetch(`${baseURL}cangjieCodeTable-${fetch_id}.min.json.gz`)
        .then(response => {
            if (!response.ok) {
                const err_msg = `A network error occurred, the request to fetch a certain program resource has failed with ${response.status}: ${response.statusText}.`;
                reportErr(err_msg);
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
    appState.resetPracticeIndex();
}

// in progress (indexeddb)
let cangjieCodesDB;
const DBOpenReq = window.indexedDB.open('CangjieCodes', 1);

DBOpenReq.onsuccess = (event) => { cangjieCodesDB = event.target.result; };

DBOpenReq.onerror = (event) => {
    reportErr(`Database error: ${event.target.error?.message}`);
};

DBOpenReq.onupgradeneeded = (event) => {
    // save the indexeddb database interface
    const db = event.target.result;

    // create an objectStore for this database
    const objectStore = db.createObjectStore("CangjieCodes", { keyPath: "id" });
};

