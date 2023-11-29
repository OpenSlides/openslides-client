import { WorkerMessage } from './interfaces';

const startedAt = Date.now();
const RESTART_LIMIT_TIME = 30 * 1000;

export function controlGeneralMessageHandler(ctx: any, e: MessageEvent<WorkerMessage>) {
    if (e.data?.nonce) {
        ctx.postMessage({ sender: `control`, action: `ack`, content: e.data.nonce });
    }
}

export function controlMessageHandler(ctx: any, e: any, broadcast: (s: string, a: string, c?: any) => void): void {
    const msg = e.data?.msg;
    const params = msg?.params;
    const action = msg?.action;
    switch (action) {
        case `terminate`:
            if (startedAt > Date.now() - RESTART_LIMIT_TIME) {
                ctx.postMessage({ sender: `control`, action: `terminate-rejected` });
            } else {
                broadcast(`control`, `terminating`);
                if (!((<any>self).Window && self instanceof (<any>self).Window)) {
                    (<any>self).close();
                }
            }
            break;
        case `ping`:
            ctx.postMessage({ sender: `control`, action: `pong`, content: params });
            break;
    }
}
