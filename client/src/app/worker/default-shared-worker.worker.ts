import { SW_BROADCAST_CHANNEL_NAME, WorkerMessage } from './interfaces';
import { authMessageHandler, initAuthWorker } from './sw-auth';
import { autoupdateMessageHandler, initAutoupdateSw } from './sw-autoupdate';
import { controlGeneralMessageHandler, controlMessageHandler, initControlMessageHandler } from './sw-control';
import { iccMessageHandler, initIccSw } from './sw-icc';

function registerMessageListener(ctx: any): void {
    const handlers = {
        autoupdate: autoupdateMessageHandler,
        icc: iccMessageHandler,
        auth: authMessageHandler,
        control: controlMessageHandler
    };

    ctx.addEventListener(`message`, (e: MessageEvent<WorkerMessage>) => {
        controlGeneralMessageHandler(ctx, e);

        const receiver = e.data?.receiver;
        if (handlers[receiver]) {
            handlers[receiver](ctx, e);
        }
    });
}

function initAll(broadcast: (s: string, a: string, c?: any) => void): void {
    initAuthWorker(broadcast);
    initAutoupdateSw(broadcast);
    initIccSw(broadcast);
    initControlMessageHandler(broadcast);
}

if ((<any>self).Window && self instanceof (<any>self).Window) {
    function broadcast(sender: string, action: string, content?: any): void {
        self.postMessage({ sender, action, content });
    }

    initAll(broadcast);

    registerMessageListener(self);
    self.postMessage(`ready`);
} else {
    const broadcastChannel = new BroadcastChannel(SW_BROADCAST_CHANNEL_NAME);
    function broadcast(sender: string, action: string, content?: any): void {
        broadcastChannel.postMessage({ sender, action, content });
    }

    initAll(broadcast);

    (<any>self).addEventListener(`connect`, (e: any) => {
        const port: MessagePort = e.ports[0];

        registerMessageListener(port);

        port.start();
        port.postMessage(`ready`);
    });
}
