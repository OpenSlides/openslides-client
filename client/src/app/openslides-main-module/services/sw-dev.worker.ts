import { addAutoupdateListener } from 'src/app/worker/sw-autoupdate';

if ((<any>self).Window && self instanceof (<any>self).Window) {
    addAutoupdateListener(self);
    self.postMessage(`ready`);
} else {
    (<any>self).addEventListener(`connect`, (e: any) => {
        const port = e.ports[0];

        addAutoupdateListener(port);

        port.start();
        port.postMessage(`ready`);
    });
}
