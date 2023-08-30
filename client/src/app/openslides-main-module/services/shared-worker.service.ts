import { Injectable, NgZone } from '@angular/core';
import { filter, firstValueFrom, fromEvent, Observable, of, Subject, take, timeout } from 'rxjs';
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
        this.connectWorker(true);
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

    private async connectWorker(checkReload = false): Promise<void> {
        if (environment.autoupdateOnSharedWorker) {
            try {
                const worker = new SharedWorker(new URL(`../../worker/default-shared-worker.worker`, import.meta.url), {
                    name: `openslides-shared-worker`
                });
                this.conn = worker.port;

                if (checkReload) {
                    await this.handleBrowserReload();
                }

                const registerListener = this.registerMessageListener();
                this.conn.start();
                await registerListener;
            } catch (e) {
                console.warn(e);
                this.setupInWindowAu();
            }
        } else {
            this.setupInWindowAu();
        }
    }

    private setupInWindowAu(): void {
        this.conn = window;
        this.registerMessageListener();
        this.zone.runOutsideAngular(() => {
            import(`../../worker/default-shared-worker.worker`);
        });
    }

    private async registerMessageListener(): Promise<Event> {
        const eventListener = fromEvent(this.conn, `message`).pipe(timeout({ first: SHARED_WORKER_READY_TIMEOUT }));
        const subscription = eventListener.subscribe((e: MessageEvent) => {
            if (this.ready && e?.data?.sender) {
                this.messages.next(e?.data);
                if (e.data.sender === `control` && e.data.action === `terminating`) {
                    this.ready = false;
                    subscription.unsubscribe();
                    setTimeout(() => this.connectWorker, SHARED_WORKER_WAIT_AFTER_TERMINATE);
                }
            } else if (e?.data === `ready`) {
                this.ready = true;
            }
        });

        return await firstValueFrom(eventListener);
    }

    /**
     * Sends a message to the worker even if not ready
     *
     * @param receiver Name of the receiver
     * @param msg Content of the message
     */
    private sendMessageForce<T extends WorkerMessageContent>(receiver: string, msg: T): void {
        this.sendRawMessage({ receiver, msg } as WorkerMessage, false);
    }

    private sendRawMessage(message: any, checkReady = true): void {
        if (this.ready || !checkReady) {
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
            const waitReady = this.waitForMessage(SHARED_WORKER_READY_TIMEOUT, (data: any) => data === `ready`);
            (<MessagePort>this.conn).start();
            await waitReady;

            const waitTerminated = this.waitForMessage(
                SHARED_WORKER_READY_TIMEOUT,
                (data: any) => data?.action === `terminating`
            );
            this.sendMessageForce(`control`, { action: `terminate` });
            await waitTerminated;
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
                timeout({ each: timeoutDuration, with: () => of(false) }),
                take(1)
            )
        );

        if (ret === false) {
            throw new Error(`Timeout while waiting for message.`);
        }
    }
}
