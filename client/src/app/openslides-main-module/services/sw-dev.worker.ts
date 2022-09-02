import { addAutoupdateListener } from 'src/app/worker/sw-autoupdate';

self.addEventListener(`connect`, (e: any) => {
    const port = e.ports[0];

    addAutoupdateListener(port);

    port.start();
    port.postMessage(`ready`);
});
