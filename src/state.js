/* Modifications: Unlicense © 2025 ngivanyh (https://github.com/ngivanyh/changjie/blob/master/LICENSE) */
/* Original Work: MIT License © 2019 Cycatz (https://github.com/ngivanyh/changjie/blob/master/LICENSE-ORIGINAL) */

export class CangjiePracticeState {
    constructor() {
        this.cangjieCodeTable = {};
        if (localStorage.hasOwnProperty('cangjieCodeTable')){
            this.cangjieCodeTable = localStorage.getItem('cangjieCodeTable');
        else {
            await fetch(`./resources/codeTable-gzipped/cangjieCodeTable-a.min.json.gz`)
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
        }
    }
}