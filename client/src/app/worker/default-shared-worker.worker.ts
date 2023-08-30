import { autoupdateMessageHandler } from 'src/app/worker/sw-autoupdate';

function registerMessageListener(ctx: any) {
    ctx.addEventListener(`message`, e => {
        const receiver = e.data?.receiver;
        if (receiver === `autoupdate`) {
            autoupdateMessageHandler(ctx, e);
        } else {
            const msg = e.data?.msg;
            const action = msg?.action;
            switch (action) {
                case `terminate`:
                    ctx.postMessage({ sender: `worker`, action: `terminating` });
                    (<any>self).close();
                    break;
                case `ping`:
                    ctx.postMessage({ sender: `worker`, action: `pong` });
                    break;
            }
        }
    });
}

if ((<any>self).Window && self instanceof (<any>self).Window) {
    registerMessageListener(self);
    self.postMessage(`ready`);
} else {
    (<any>self).addEventListener(`connect`, (e: any) => {
        const port: MessagePort = e.ports[0];

        registerMessageListener(self);

        port.start();
        port.postMessage(`ready`);
    });
}
