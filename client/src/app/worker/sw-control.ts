import { Broadcaster, WorkerMessage } from './interfaces';
import { ControlAcknowledgement, ControlMessage, ControlPong, ControlTerminateRejected } from './sw-control.interfaces';

const startedAt = Date.now();
const RESTART_LIMIT_TIME = 30 * 1000;
let broadcast: Broadcaster;

export function initControlMessageHandler(b: Broadcaster): void {
    broadcast = b;
}

export function controlGeneralMessageHandler(ctx: any, e: MessageEvent<WorkerMessage<any>>): void {
    if (e.data?.nonce) {
        ctx.postMessage({ sender: `control`, action: `ack`, content: e.data.nonce } as ControlAcknowledgement);
    }
}

export function controlMessageHandler(ctx: any, e: MessageEvent<ControlMessage>): void {
    const msg = e.data.msg;
    switch (msg.action) {
        case `terminate`:
            if (startedAt > Date.now() - RESTART_LIMIT_TIME) {
                ctx.postMessage({ sender: `control`, action: `terminate-rejected` } as ControlTerminateRejected);
            } else {
                broadcast(`control`, `terminating`);
                if (!((<any>self).Window && self instanceof (<any>self).Window)) {
                    (<any>self).close();
                }
            }
            break;
        case `ping`:
            ctx.postMessage({ sender: `control`, action: `pong`, content: msg.params } as ControlPong);
            break;
    }
}
