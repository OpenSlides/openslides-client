import { Injectable, NgZone } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { WorkerMessage, WorkerMessageContent, WorkerResponse } from 'src/app/worker/interfaces';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: `root`
})
export class SharedWorkerService {
    public messages: Subject<WorkerResponse> = new Subject();

    private conn: MessagePort | Window;
    private ready = false;

    constructor(private zone: NgZone) {
        if (environment.autoupdateOnSharedWorker) {
            try {
                const worker = new SharedWorker(new URL(`./default-shared-worker.worker`, import.meta.url), {
                    name: `openslides-shared-worker`
                });
                this.conn = worker.port;
                this.registerMessageListener();
                worker.port.start();
            } catch (e) {
                this.setupInWindowAu();
            }
        } else {
            this.setupInWindowAu();
        }
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

    private setupInWindowAu(): void {
        this.conn = window;
        this.registerMessageListener();
        this.zone.runOutsideAngular(() => {
            import(`./default-shared-worker.worker`);
        });
    }

    private registerMessageListener(): void {
        this.conn.addEventListener(`message`, (e: any) => {
            if (this.ready && e?.data?.sender) {
                this.messages.next(e?.data);
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
