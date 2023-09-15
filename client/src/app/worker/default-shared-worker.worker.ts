import { SW_BROADCAST_CHANNEL_NAME, WorkerMessage } from './interfaces';
import { autoupdateMessageHandler } from './sw-autoupdate';
import { controlGeneralMessageHandler, controlMessageHandler } from './sw-control';

const broadcastChannel = new BroadcastChannel(SW_BROADCAST_CHANNEL_NAME);
function broadcast(sender: string, action: string, content?: any) {
    broadcastChannel.postMessage({ sender, action, content });
}

function registerMessageListener(ctx: any) {
    ctx.addEventListener(`message`, (e: MessageEvent<WorkerMessage>) => {
        controlGeneralMessageHandler(ctx, e);

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
    self.postMessage(`ready`);
} else {
    (<any>self).addEventListener(`connect`, (e: any) => {
        const port: MessagePort = e.ports[0];

        registerMessageListener(port);

        port.start();
        port.postMessage(`ready`);
    });
}
