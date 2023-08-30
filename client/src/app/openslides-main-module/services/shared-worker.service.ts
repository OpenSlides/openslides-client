import { Injectable, NgZone } from '@angular/core';
import { catchError, filter, firstValueFrom, fromEvent, Observable, of, Subject, take, timeout } from 'rxjs';
import { WorkerMessage, WorkerMessageContent, WorkerResponse } from 'src/app/worker/interfaces';
import { environment } from 'src/environments/environment';

const SHARED_WORKER_READY_TIMEOUT = 2000;
const SHARED_WORKER_WAIT_AFTER_TERMINATE = 2000;

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
                const worker = new SharedWorker(new URL(`../../worker/default-shared-worker.worker`, import.meta.url), {
                    name: `openslides-shared-worker`
                });
                this.conn = worker.port;

                this.handleBrowserReload()
                    .then(() => {
                        this.registerMessageListener();
                        (<MessagePort>this.conn).start();
                    })
                    .catch(() => this.setupInWindowAu());
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
            import(`../../worker/default-shared-worker.worker`);
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

    private async handleBrowserReload(): Promise<void> {
        if (
            (window.performance.navigation && window.performance.navigation.type === 1) ||
            (window.performance.getEntriesByType &&
                window.performance
                    .getEntriesByType(`navigation`)
                    .map(nav => nav.name)
                    .includes(`reload`))
        ) {
            const CONN_START_TIMEOUT = 20;
            setTimeout(() => {
                (<MessagePort>this.conn).start();
            }, CONN_START_TIMEOUT);
            await this.waitForMessage(
                SHARED_WORKER_READY_TIMEOUT + CONN_START_TIMEOUT,
                (data: any) => data === `ready`
            );

            this.sendMessage(`control`, { action: `terminate` });
            await this.waitForMessage(SHARED_WORKER_READY_TIMEOUT, (data: any) => data?.action === `terminating`);
            await new Promise(r => setTimeout(r, SHARED_WORKER_WAIT_AFTER_TERMINATE));

            const worker = new SharedWorker(new URL(`../../worker/default-shared-worker.worker`, import.meta.url), {
                name: `openslides-shared-worker`
            });
            this.conn = worker.port;
        }
    }

    private async waitForMessage(timeoutDuration: number, isMessage: (data?: any) => boolean): Promise<void> {
        const ret = await firstValueFrom(
            fromEvent(this.conn, `message`).pipe(
                filter(e => isMessage((<any>e)?.data)),
                timeout(timeoutDuration),
                catchError(() => of(false)),
                take(1)
            )
        );

        if (ret === false) {
            throw new Error(`Timeout while waiting for message.`);
        }
    }
}
