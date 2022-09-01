import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: `root`
})
export class SharedWorkerService {
    private conn: MessagePort | ServiceWorker;

    constructor() {
        if (!environment.production) {
            let worker = new SharedWorker('worker/sw-dev.js', { name: 'sw-dev' });
            this.conn = worker.port;
        } else {
            navigator.serviceWorker.ready.then((registration) => {
                if (registration.active) {
                    this.conn = registration.active;
                }
            });
        }
    }

    public sendRawMessage(message: any) {
        this.conn.postMessage(message);
    }
}
