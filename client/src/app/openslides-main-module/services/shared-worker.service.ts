import { Injectable, NgZone } from '@angular/core';
import {
    defer,
    filter,
    first,
    firstValueFrom,
    forkJoin,
    from,
    fromEvent,
    merge,
    Observable,
    of,
    repeat,
    retry,
    Subject,
    Subscription,
    timeout,
    timer
} from 'rxjs';
import {
    SW_BROADCAST_CHANNEL_NAME,
    WorkerMessage,
    WorkerMessageContent,
    WorkerResponse
} from 'src/app/worker/interfaces';
import { environment } from 'src/environments/environment';

const SHARED_WORKER_MESSAGE_ACK_TIMEOUT = 4000;
const SHARED_WORKER_READY_TIMEOUT = 10000;
const SHARED_WORKER_READY_TIMEOUT_TERMINATE = 2000;
const SHARED_WORKER_WAIT_AFTER_TERMINATE = 2000;
const SHARED_WORKER_HEALTHCHECK_INTERVAL = 5000;
const SHARED_WORKER_HEALTH_RESPONSE_TIMEOUT = 8000;
const SHARED_WORKER_HEALTH_RETRIES = 2;

@Injectable({
    providedIn: `root`
})
export class SharedWorkerService {
    public messages: Subject<WorkerResponse> = new Subject();

    public get restartObservable(): Observable<void> {
        return this.restartSubject;
    }

    private restartSubject: Subject<void> = new Subject();
    private conn: MessagePort | Window;
    private broadcastChannel = new BroadcastChannel(SW_BROADCAST_CHANNEL_NAME);
    private ready = false;
    private healthCheckSubscription: Subscription;
    private messageEventSubscription: Subscription;
    private windowMode = false;

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
     * Sends a message to the worker.
     * Resolves if the message got received.
     *
     * @param receiver Name of the receiver
     * @param msg Content of the message
     */
    public async sendMessage<T extends WorkerMessageContent>(receiver: string, msg: T): Promise<void> {
        const nonce = Math.random() * 100000000;
        let ack: Promise<any>;
        await this.sendRawMessage({ receiver, msg, nonce } as WorkerMessage, true, () => {
            ack = firstValueFrom(
                this.listenTo(`control`).pipe(
                    filter(data => data?.action === `ack` && data?.content === nonce),
                    timeout(SHARED_WORKER_MESSAGE_ACK_TIMEOUT)
                )
            );
        });

        let restarted = false;
        const restartSubscription = this.restartSubject.subscribe(() => {
            restarted = true;
        });
        try {
            await ack;
        } catch (e) {
            if (!restarted) {
                await this.handleFault();
            }
            await this.sendMessage(receiver, msg);
        }
        restartSubscription.unsubscribe();
    }

    private async connectWorker(checkReload = false): Promise<void> {
        if (this.conn) {
            this.conn.close();
        }

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
                console.debug(`[shared worker service] Using shared worker`);
                this.startHealthCheck();
            } catch (e) {
                console.warn(e);
                if (this.conn) {
                    this.conn.removeAllListeners();
                }
                this.setupInWindowAu();
                console.debug(`[shared worker service] Using in window after error`);
            }
        } else {
            this.setupInWindowAu();
            console.debug(`[shared worker service] Using in window worker`);
        }
    }

    private setupInWindowAu(): void {
        this.conn = window;
        this.windowMode = true;
        this.registerMessageListener();
        this.zone.runOutsideAngular(() => {
            import(`../../worker/default-shared-worker.worker`);
        });
    }

    private startHealthCheck(): void {
        if (this.healthCheckSubscription) {
            this.healthCheckSubscription.unsubscribe();
        }

        this.zone.runOutsideAngular(() => {
            this.healthCheckSubscription = forkJoin([
                timer(SHARED_WORKER_HEALTHCHECK_INTERVAL),
                defer(() =>
                    from(
                        this.waitForMessage(
                            SHARED_WORKER_HEALTH_RESPONSE_TIMEOUT,
                            m => m.sender === `control` && m.action === `pong`,
                            () => this.sendMessageForce(`control`, { action: `ping` })
                        )
                    )
                )
            ])
                .pipe(retry(SHARED_WORKER_HEALTH_RETRIES), repeat())
                .subscribe({
                    error: () => this.handleFault()
                });
        });
    }

    private async handleFault(): Promise<void> {
        if (this.ready === false) {
            return;
        }

        this.ready = false;
        if (this.messageEventSubscription) {
            this.messageEventSubscription.unsubscribe();
        }
        if (this.healthCheckSubscription) {
            this.healthCheckSubscription.unsubscribe();
        }
        this.restartSubject.next();
        await this.connectWorker();
    }

    private async registerMessageListener(): Promise<Event> {
        let eventListener = this.windowMode
            ? fromEvent(this.conn, `message`)
            : merge(fromEvent(this.conn, `message`), fromEvent(this.broadcastChannel, `message`));
        if (!this.windowMode) {
            eventListener = eventListener.pipe(timeout({ first: SHARED_WORKER_READY_TIMEOUT }));
        }
        if (this.messageEventSubscription) {
            this.messageEventSubscription.unsubscribe();
        }

        this.messageEventSubscription = eventListener.subscribe((e: MessageEvent) => {
            if (this.ready && e?.data?.sender) {
                this.messages.next(e?.data);
                if (e.data.sender === `control` && e.data.action === `terminating`) {
                    this.ready = false;
                    this.messageEventSubscription.unsubscribe();
                    this.restartSubject.next();
                    setTimeout(() => {
                        this.connectWorker();
                    }, SHARED_WORKER_WAIT_AFTER_TERMINATE);
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
    private async sendMessageForce<T extends WorkerMessageContent>(receiver: string, msg: T): Promise<void> {
        return await this.sendRawMessage({ receiver, msg } as WorkerMessage, false);
    }

    private async sendRawMessage(message: any, checkReady = true, beforeSend?: () => void): Promise<void> {
        if (this.ready || !checkReady) {
            if (beforeSend) {
                beforeSend();
            }
            this.conn.postMessage(message);
        } else {
            await new Promise(r => setTimeout(r, 10));
            return await this.sendRawMessage(message);
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
            let readyFailed = false;
            try {
                await this.waitForMessage(
                    SHARED_WORKER_READY_TIMEOUT_TERMINATE,
                    (data: any) => data === `ready`,
                    () => (<MessagePort>this.conn).start()
                );
            } catch (_) {
                readyFailed = true;
                console.debug(`[shared worker] failed ready wait`);
            }

            try {
                const terminateResp = await this.waitForMessage(
                    readyFailed ? SHARED_WORKER_READY_TIMEOUT_TERMINATE : SHARED_WORKER_READY_TIMEOUT,
                    (data: any) => data?.action === `terminating` || data?.action === `terminate-rejected`,
                    () => this.sendMessageForce(`control`, { action: `terminate` })
                );
                if (terminateResp.data.action === `terminate-rejected`) {
                    this.ready = true;
                    return;
                }
            } catch (_) {
                console.debug(`[shared worker] failed term wait`);
            }
            await new Promise(r => setTimeout(r, SHARED_WORKER_WAIT_AFTER_TERMINATE));

            const worker = new SharedWorker(new URL(`../../worker/default-shared-worker.worker`, import.meta.url), {
                name: `openslides-shared-worker`
            });
            this.conn = worker.port;
        }
    }

    private async waitForMessage(
        timeoutDuration: number,
        isMessage: (data?: any) => boolean,
        doBefore?: () => void
    ): Promise<MessageEvent<WorkerResponse>> {
        const eventListener = this.windowMode
            ? fromEvent(this.conn, `message`)
            : merge(fromEvent(this.conn, `message`), fromEvent(this.broadcastChannel, `message`));
        const promise = firstValueFrom(
            eventListener.pipe(
                first(e => isMessage((<any>e)?.data)),
                timeout({ first: timeoutDuration, with: () => of(false) })
            )
        );

        if (doBefore) {
            doBefore();
        }

        if ((await promise) === false) {
            throw new Error(`Timeout while waiting for message.`);
        }

        return <MessageEvent>await promise;
    }
}
