import * as fzstd from 'fzstd';

let send: any;
let openStreams: {
    requestHash: string;
    request: Object;
    abortCtrl: AbortController;
    resendLast: () => void;
}[] = [];
function searchRequest(requestHash: string, request: Object): null | number {
    for (let i of Object.keys(openStreams)) {
        const stream = openStreams[i];
        if (stream.requestHash === requestHash && JSON.stringify(stream.request) === JSON.stringify(request)) {
            return +i;
        }
    }

    return null;
}

async function openConnection(ctx, { streamId, authToken, method, url, request, requestHash }) {
    const headers: any = {
        'Content-Type': `application/json`
    };

    if (authToken) {
        headers.authentication = authToken;
    }

    const existingRequest = searchRequest(requestHash, request);
    if (existingRequest) {
        ctx.postMessage(
            JSON.stringify({
                sender: `autoupdate`,
                action: `set-streamid`,
                content: {
                    requestHash,
                    existing: true,
                    streamId: existingRequest
                }
            })
        );

        openStreams[existingRequest].resendLast();
        return;
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

    let currentData = null;
    openStreams[nextId] = {
        requestHash,
        request,
        abortCtrl: new AbortController(),
        resendLast: () => {
            if (currentData) {
                send(
                    JSON.stringify({
                        sender: `autoupdate`,
                        action: `receive-data`,
                        content: {
                            streamId: nextId,
                            data: currentData
                        }
                    })
                );
            } else {
                setTimeout(() => openStreams[nextId].resendLast(), 10);
            }
        }
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
                        currentData = decode(val.slice(lastSent, i));
                        openStreams[nextId].resendLast();
                    } else {
                        const nTmp = new Uint8Array(i - lastSent + 1 + next.length);
                        nTmp.set(next);
                        nTmp.set(val.slice(lastSent, i), next.length);

                        currentData = decode(val.slice(lastSent, i));
                        openStreams[nextId].resendLast();
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

export function addAutoupdateListener(context: any, sendFn: (m: any) => void) {
    send = sendFn;
    context.addEventListener(`message`, e => {
        try {
            const data = JSON.parse(e.data);
            if (data.receiver === `autoupdate`) {
                const msg = data.msg;
                const action = msg?.action;
                const params = msg?.params;
                if (action === `open`) {
                    openConnection(context, params);
                } else if (action === `close`) {
                    closeConnection(params);
                }
            }
        } catch (e) {}
    });
}
