import { Injectable } from '@angular/core';
import { filter, Observable, Subscriber } from 'rxjs';
import { WorkerMessage, WorkerMessageContent, WorkerResponse } from 'src/app/worker/interfaces';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: `root`
})
export class SharedWorkerService {
    public messages: Observable<WorkerResponse>;

    private conn: MessagePort | Window;
    private ready = false;

    constructor() {
        if (environment.autoupdateOnSharedWorker) {
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
        } else {
            import(`./default-shared-worker.worker`);
            this.conn = window;
        }

        this.messages = new Observable<WorkerResponse>(subscriber => {
            this.registerMessageListener(subscriber);
        });
    }

    /**
     * Listen to messages from the worker of a specific sender
     *
     * @param sender Name of the sender
     */
    public listenTo(sender: string): Observable<WorkerResponse> {
        return this.messages.pipe(filter(data => data?.sender === sender));
    }

    /**
     * Sends a message to the worker
     *
     * @param receiver Name of the receiver
     * @param msg Content of the message
     */
    public sendMessage<T extends WorkerMessageContent>(receiver: string, msg: T): void {
        this.sendRawMessage({ receiver, msg } as WorkerMessage);
    }

    private registerMessageListener(subscriber: Subscriber<WorkerResponse>): void {
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
