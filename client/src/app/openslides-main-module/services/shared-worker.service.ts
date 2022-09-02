import { Injectable } from '@angular/core';
import { filter, Observable, Subscriber } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: `root`
})
export class SharedWorkerService {
    private conn: MessagePort | ServiceWorker | Window;
    private subscriber: Subscriber<any>;
    public messages: Observable<any>;
    private ready = false;

    constructor() {
        this.messages = new Observable<any>(subscriber => {
            this.subscriber = subscriber;
        });

        if (!environment.production) {
            if (SharedWorker) {
                let worker = new SharedWorker(new URL(`./sw-dev.worker`, import.meta.url), { name: `sw-dev` });
                worker.port.start();
                this.conn = worker.port;
            } else {
                import(`./sw-dev.worker`);
                this.conn = window;
            }
        } else {
            navigator.serviceWorker.ready.then(registration => {
                if (registration.active) {
                    this.conn = registration.active;
                }
            });
        }

        this.conn.addEventListener(`message`, (e: any) => {
            try {
                if (this.ready) {
                    this.subscriber.next(JSON.parse(e?.data));
                } else if (e?.data === `ready`) {
                    this.ready = true;
                }
            } catch (e) {
                console.error(e);
            }
        });
    }

    public listenTo(sender: string) {
        return this.messages.pipe(
            filter(data => {
                try {
                    return data.sender === sender;
                } catch (e) {
                    return false;
                }
            })
        );
    }

    public sendMessage(receiver: string, msg: any) {
        this.sendRawMessage(JSON.stringify({ receiver, msg }));
    }

    private sendRawMessage(message: any) {
        if (this.ready) {
            this.conn.postMessage(message);
        } else {
            setTimeout(() => this.sendRawMessage(message), 10);
        }
    }
}
