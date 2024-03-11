import { Directive, inject } from '@angular/core';
import { filter, Observable } from 'rxjs';

import { SharedWorkerService } from '../openslides-main-module/services/shared-worker.service';
import { ActiveMeetingIdService } from '../site/pages/meetings/services/active-meeting-id.service';
import { CommunicationManagerService } from '../site/services/communication-manager.service';
import { WorkerResponse } from '../worker/interfaces';
import { HttpService } from './http.service';
import { HttpStreamEndpointService, HttpStreamService } from './http-stream';

const ICC_ENDPOINT = `icc`;

export const ICC_PATH = `/system/icc`;

/**
 * Base service for services which listen to the ICC service.
 *
 * Contains the connect, disconnect and send logic.
 */
@Directive()
export abstract class BaseICCGatewayService<ICCResponseType> {
    protected abstract readonly serviceDescription: string;

    /**
     * Path ending for receiving messages, will automatically be appended to '/system/icc' before usage.
     */
    protected abstract readonly receivePath: string;

    /**
     * Path ending for sending messages, will automatically be appended to '/system/icc' before usage.
     */
    protected abstract readonly sendPath: string;

    private readonly healthPath: string = `${ICC_PATH}/health`;

    private connectionClosingFn: (() => void) | undefined;

    private get iccEndpointName(): string {
        return ICC_ENDPOINT + `_` + this.serviceDescription;
    }

    private httpService = inject(HttpService);
    private httpStreamService = inject(HttpStreamService);
    protected activeMeetingIdService = inject(ActiveMeetingIdService);
    private communicationManager = inject(CommunicationManagerService);
    private httpEndpointService = inject(HttpStreamEndpointService);
    private sharedWorker = inject(SharedWorkerService);

    /**
     * Can be called in the subclasses constructor after the super call.
     * Sets up automatic connection to and disconnection from the ICC service.
     */
    protected setupConnections(): void {
        this.activeMeetingIdService.meetingIdObservable.subscribe(meetingId => {
            if (meetingId) {
                this.connect(meetingId);
            } else {
                this.disconnect();
            }
        });
    }

    public async connect(meetingId: number): Promise<void> {
        console.log(`${this.serviceDescription}: Subscribe to ICC service with: meeting_id=${meetingId}`);
        if (!meetingId) {
            throw new Error(`Cannot subscribe to ICC, no meeting ID was provided`);
        }

        if (!this.receivePath) {
            throw new Error(`Cannot subscribe to ICC, no path was provided`);
        }

        this.disconnect();
        this.sendConnectToWorker(meetingId);

        const onReastartSub = this.sharedWorker.restartObservable.subscribe(() => {
            this.sendConnectToWorker(meetingId);
        });
        const msgSub = this.messageObservable(meetingId).subscribe(resp => this.onMessage(resp.content?.data));
        const onClosedSub = this.closedObservable(meetingId).subscribe(() => {
            this.connectionClosingFn = undefined;
            onReastartSub.unsubscribe();
            msgSub.unsubscribe();
            onClosedSub.unsubscribe();
        });
        this.connectionClosingFn = () => {
            onReastartSub.unsubscribe();
            msgSub.unsubscribe();
            onClosedSub.unsubscribe();
            this.sharedWorker.sendMessage(`icc`, {
                action: `disconnect`,
                params: {
                    type: this.receivePath,
                    meetingId
                }
            } as any);
        };
    }

    public disconnect(): void {
        if (this.connectionClosingFn) {
            this.connectionClosingFn();
            this.connectionClosingFn = undefined;
        }
    }

    /**
     * Define what happens when a message is received from the ICC service.
     * @param message The message that was received.
     */
    protected abstract onMessage(message: ICCResponseType): void;

    /**
     * General send function for messages. Subclasses should call this to build their own more specific send functions.
     */
    protected async send(data?: any): Promise<void> {
        if (!this.sendPath) {
            throw new Error(`Cannot send to ICC, no path was provided`);
        }
        if (data) {
            console.debug(`Send following data over ICC:`, `${ICC_PATH}${this.sendPath}`, data);
            await this.httpService.post<unknown>(`${ICC_PATH}${this.sendPath}`, data);
        } else {
            console.debug(`Send message to ICC with following route:`, `${ICC_PATH}${this.sendPath}`);
            await this.httpService.post<unknown>(`${ICC_PATH}${this.sendPath}`);
        }
    }

    private sendConnectToWorker(meetingId: number): void {
        this.sharedWorker.sendMessage(`icc`, {
            action: `connect`,
            params: {
                type: this.receivePath,
                meetingId
            }
        } as any);
    }

    private messageObservable(meetingId: number): Observable<WorkerResponse> {
        return this.sharedWorker
            .listenTo(`icc`)
            .pipe(
                filter(
                    data =>
                        data?.action === `receive-data` &&
                        data.content?.type === this.receivePath &&
                        data.content?.meeting_id === meetingId
                )
            );
    }

    private closedObservable(meetingId: number): Observable<WorkerResponse> {
        return this.sharedWorker
            .listenTo(`icc`)
            .pipe(
                filter(
                    data =>
                        data?.action === `closed` &&
                        data.content?.type === this.receivePath &&
                        data.content?.meetingId === meetingId
                )
            );
    }
}
