import { addAutoupdateListener } from 'src/app/worker/sw-autoupdate';

importScripts(`ngsw-worker.js`);

addAutoupdateListener(self, (m: any) => {
    self.postMessage(m);
});
