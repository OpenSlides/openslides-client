import { addAutoupdateListener } from 'src/app/worker/sw-autoupdate';

if ((<any>self).Window && self instanceof (<any>self).Window) {
    addAutoupdateListener(self);
    self.postMessage(`ready`);
} else {
    let ports: MessagePort[] = [];

    (<any>self).addEventListener(`connect`, (e: any) => {
        const port: MessagePort = e.ports[0];
        ports.push(port);

        addAutoupdateListener(port);

        port.start();
        port.postMessage(`ready`);
    });
}
