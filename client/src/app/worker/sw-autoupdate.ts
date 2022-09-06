import * as fzstd from 'fzstd';

// let send: any;
let openStreams: {
    requestHash: string;
    request: Object;
    abortCtrl: AbortController;
    ports: MessagePort[];
    resendLast: (ctx?: MessagePort) => void;
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

function sendToPorts(ports: MessagePort[], message: any) {
    for (let port of ports) {
        port.postMessage(message);
    }
}

async function openConnection(ctx: MessagePort, { streamId, authToken, method, url, request, requestHash }) {
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

        openStreams[existingRequest].ports.push(ctx);
        openStreams[existingRequest].resendLast(ctx);
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

    let currentData = {};
    openStreams[nextId] = {
        requestHash,
        request,
        abortCtrl: new AbortController(),
        ports: [ctx],
        resendLast: (ctx: MessagePort) => {
            if (Object.keys(currentData).length > 0) {
                ctx.postMessage(
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
                setTimeout(() => openStreams[nextId].resendLast(ctx), 10);
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

        function sendAutoupdate(data) {
            sendToPorts(
                openStreams[nextId].ports,
                JSON.stringify({
                    sender: `autoupdate`,
                    action: `receive-data`,
                    content: {
                        streamId: nextId,
                        data: data
                    }
                })
            );
        }

        let result: ReadableStreamDefaultReadResult<Uint8Array>;
        while (!(result = await reader.read()).done) {
            const val = result.value;
            let lastSent = 0;
            for (let i = 0; i < val.length; i++) {
                if (val[i] === 10) {
                    if (next === null) {
                        const data = decode(val.slice(lastSent, i));
                        currentData = Object.assign(currentData, data);
                        sendAutoupdate(data);
                    } else {
                        const nTmp = new Uint8Array(i - lastSent + 1 + next.length);
                        nTmp.set(next);
                        nTmp.set(val.slice(lastSent, i), next.length);

                        const data = decode(nTmp.slice(lastSent, i));
                        currentData = Object.assign(currentData, data);
                        sendAutoupdate(data);
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

async function closeConnection(ctx: MessagePort, { streamId }) {
    let portIdx = openStreams[streamId].ports.indexOf(ctx);
    if (portIdx !== -1) {
        openStreams[streamId].ports.splice(portIdx);
    }

    if (!openStreams[streamId].ports.length) {
        console.log(`close ${streamId}`);
        // @ts-ignore
        openStreams[streamId].abortCtrl.abort();
    }
}

export function addAutoupdateListener(context: any) {
    context.addEventListener(`message`, e => {
        try {
            const data = JSON.parse(e.data);
            const msg = data.msg;
            const action = msg?.action;
            const params = msg?.params;
            if (data.receiver === `autoupdate`) {
                if (action === `open`) {
                    openConnection(context, params);
                } else if (action === `close`) {
                    closeConnection(context, params);
                }
            }
        } catch (e) {}
    });
}
