import { Injectable } from '@angular/core';
import { filter, Observable, Subscriber } from 'rxjs';

@Injectable({
    providedIn: `root`
})
export class SharedWorkerService {
    public messages: Observable<any>;

    private conn: MessagePort | Window;
    private ready = false;

    constructor() {
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

        this.messages = new Observable<any>(subscriber => {
            this.registerMessageListener(subscriber);
        });
    }

    /**
     * Listen to messages from the worker of a specific sender
     *
     * @param sender Name of the sender
     */
    public listenTo(sender: string): Observable<any> {
        return this.messages.pipe(filter(data => data?.sender === sender));
    }

    /**
     * Sends a message to the worker
     *
     * @param receiver Name of the receiver
     * @param msg Content of the message
     */
    public sendMessage(receiver: string, msg: any): void {
        this.sendRawMessage({ receiver, msg });
    }

    private registerMessageListener(subscriber: Subscriber<any>): void {
        this.conn.addEventListener(`message`, (e: any) => {
            if (this.ready && e?.data?.sender) {
                subscriber.next(e?.data);
            } else if (e?.data === `ready`) {
                this.ready = true;
            }
        });
    }

    private sendRawMessage(message: any): void {
        if (this.ready) {
            this.conn.postMessage(message);
        } else {
            setTimeout(() => this.sendRawMessage(message), 10);
        }
    }
}
