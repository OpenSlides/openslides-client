import { autoupdateMessageHandler } from './sw-autoupdate';
import { controlMessageHandler } from './sw-control';

function registerMessageListener(ctx: any) {
    ctx.addEventListener(`message`, e => {
        const receiver = e.data?.receiver;
        if (receiver === `autoupdate`) {
            autoupdateMessageHandler(ctx, e);
        } else if (receiver === `control`) {
            controlMessageHandler(ctx, e);
        }
    });
}

if ((<any>self).Window && self instanceof (<any>self).Window) {
    registerMessageListener(self);
    self.postMessage(`ready`);
} else {
    (<any>self).addEventListener(`connect`, (e: any) => {
        const port: MessagePort = e.ports[0];

        registerMessageListener(port);

        port.start();
        port.postMessage(`ready`);
    });
}
