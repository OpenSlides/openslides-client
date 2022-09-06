import { addAutoupdateListener } from 'src/app/worker/sw-autoupdate';

if ((<any>self).Window && self instanceof (<any>self).Window) {
    let send = function (m: any) {
        self.postMessage(m);
    };

    addAutoupdateListener(self, send);
    self.postMessage(`ready`);
} else {
    let ports = [];
    let send = function (m: any) {
        for (let port of ports) {
            port.postMessage(m);
        }
    };

    (<any>self).addEventListener(`connect`, (e: any) => {
        const port = e.ports[0];
        ports.push(port);

        addAutoupdateListener(port, send);

        port.start();
        port.postMessage(`ready`);
    });
}
