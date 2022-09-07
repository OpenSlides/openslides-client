import { Injectable } from '@angular/core';
import { filter, Observable, Subscriber } from 'rxjs';

@Injectable({
    providedIn: `root`
})
export class SharedWorkerService {
    private conn: MessagePort | Window;
    private subscriber: Subscriber<any>;
    public messages: Observable<any>;
    private ready = false;

    constructor() {
        this.messages = new Observable<any>(subscriber => {
            this.subscriber = subscriber;
        });

        try {
            let worker = new SharedWorker(new URL(`./default-shared-worker.worker`, import.meta.url), {
                name: `openslides-shared-worker`
            });
            worker.port.start();
            this.conn = worker.port;
        } catch (e) {
            import(`./default-shared-worker.worker`);
            this.conn = window;
        }

        this.registerMessageListener();
    }

    private registerMessageListener() {
        this.conn.addEventListener(`message`, (e: any) => {
            if (this.ready && e?.data?.sender) {
                this.subscriber.next(e?.data);
            } else if (e?.data === `ready`) {
                this.ready = true;
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
        this.sendRawMessage({ receiver, msg });
    }

    private sendRawMessage(message: any) {
        if (this.ready) {
            this.conn.postMessage(message);
        } else {
            setTimeout(() => this.sendRawMessage(message), 10);
        }
    }
}
