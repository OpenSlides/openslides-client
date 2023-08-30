import { autoupdateMessageHandler } from './sw-autoupdate';
import { controlMessageHandler } from './sw-control';

const contexts = [];

function broadcast(sender: string, action: string, content?: any) {
    for (const ctx of contexts) {
        ctx.postMessage({ sender, action, content });
    }
}

function registerMessageListener(ctx: any) {
    ctx.addEventListener(`message`, e => {
        const receiver = e.data?.receiver;
        if (receiver === `autoupdate`) {
            autoupdateMessageHandler(ctx, e);
        } else if (receiver === `control`) {
            controlMessageHandler(ctx, e, broadcast);
        }
    });
}

if ((<any>self).Window && self instanceof (<any>self).Window) {
    registerMessageListener(self);
    contexts.push(self);
    self.postMessage(`ready`);
} else {
    (<any>self).addEventListener(`connect`, (e: any) => {
        const port: MessagePort = e.ports[0];

        registerMessageListener(port);

        port.start();
        contexts.push(port);
        port.postMessage(`ready`);
    });
}
