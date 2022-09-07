import { Injectable } from '@angular/core';
import { filter, Observable, Subscriber } from 'rxjs';

@Injectable({
    providedIn: `root`
})
export class SharedWorkerService {
    private conn: MessagePort | Window;
    public messages: Observable<any>;
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

    private registerMessageListener(subscriber: Subscriber<any>) {
        this.conn.addEventListener(`message`, (e: any) => {
            if (this.ready && e?.data?.sender) {
                subscriber.next(e?.data);
            } else if (e?.data === `ready`) {
                this.ready = true;
            }
        });
    }

    /**
     * Listen to messages from the worker of a specific sender
     *
     * @param sender Name of the sender
     */
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

    /**
     * Sends a message to the worker
     *
     * @param receiver Name of the receiver
     * @param msg Content of the message
     */
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
