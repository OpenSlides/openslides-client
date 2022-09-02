import * as fzstd from 'fzstd';

let ctx: any;
let openStreams: { abortCtrl: AbortController }[] = [];
async function openConnection({ streamId, authToken, method, url, request, requestHash }) {
    const headers: any = {
        'Content-Type': `application/json`
    };

    if (authToken) {
        headers.authentication = authToken;
    }

    const nextId = streamId || Math.floor(Math.random() * (900000 - 1) + 100000);
    ctx.postMessage(
        JSON.stringify({
            sender: `autoupdate`,
            action: `set-streamid`,
            content: {
                requestHash,
                streamId: nextId
            }
        })
    );

    openStreams[nextId] = {
        abortCtrl: new AbortController()
    };

    try {
        const response = await fetch(url, {
            signal: openStreams[nextId].abortCtrl.signal,
            method: method,
            headers,
            body: JSON.stringify([request])
        });

        const reader = response.body.getReader();
        let next = null;
        function decode(data: Uint8Array) {
            try {
                const content = new TextDecoder().decode(data);
                const atobbed = Uint8Array.from(atob(content), c => c.charCodeAt(0));
                const decompressedArray = fzstd.decompress(atobbed);
                const decompressedString = new TextDecoder().decode(decompressedArray);

                return JSON.parse(decompressedString);
            } catch (e) {
                console.error(e);
                return null;
            }
        }

        let result: ReadableStreamDefaultReadResult<Uint8Array>;
        while (!(result = await reader.read()).done) {
            const val = result.value;
            let lastSent = 0;
            for (let i = 0; i < val.length; i++) {
                if (val[i] === 10) {
                    if (next === null) {
                        ctx.postMessage(
                            JSON.stringify({
                                sender: `autoupdate`,
                                action: `receive-data`,
                                content: {
                                    streamId: nextId,
                                    data: decode(val.slice(lastSent, i))
                                }
                            })
                        );
                    } else {
                        const nTmp = new Uint8Array(i - lastSent + 1 + next.length);
                        nTmp.set(next);
                        nTmp.set(val.slice(lastSent, i), next.length);

                        ctx.postMessage(
                            JSON.stringify({
                                sender: `autoupdate`,
                                action: `receive-data`,
                                content: {
                                    streamId: nextId,
                                    data: decode(val.slice(lastSent, i))
                                }
                            })
                        );
                    }
                    lastSent = i + 1;
                    next = null;
                } else if (i === val.length - 1) {
                    if (next) {
                        const nTmp = new Uint8Array(i - lastSent + 1 + next.length);
                        nTmp.set(next);
                        nTmp.set(val.slice(lastSent, i), next.length);
                        next = nTmp;
                    } else {
                        next = val.slice(lastSent, i);
                    }
                }
            }
        }
    } catch (e) {
        if (e.name !== `AbortError`) {
            console.error(e);
        }
    }
}

async function closeConnection({ streamId }) {
    if (openStreams[streamId]) {
        // @ts-ignore
        openStreams[streamId].abortCtrl.abort();
    }
}

export function addAutoupdateListener(context: any) {
    ctx = context;
    ctx.addEventListener(`message`, e => {
        try {
            const data = JSON.parse(e.data);
            if (data.receiver === `autoupdate`) {
                const msg = data.msg;
                const action = msg?.action;
                const params = msg?.params;
                if (action === `open`) {
                    openConnection(params);
                } else if (action === `close`) {
                    closeConnection(params);
                }
            }
        } catch (e) {}
    });
}
