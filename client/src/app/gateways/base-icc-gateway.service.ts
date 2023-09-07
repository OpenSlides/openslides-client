import { Directive } from '@angular/core';

import { HttpMethod } from '../infrastructure/definitions/http';
import { ActiveMeetingIdService } from '../site/pages/meetings/services/active-meeting-id.service';
import { CommunicationManagerService } from '../site/services/communication-manager.service';
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

    /**
     * Constructor to create the Service.
     * Subclasses can call {@link setupConnections} after the super call to initialize automatic meeting-based connection handling.
     * Otherwise connections need to be managed manually.
     */
    public constructor(
        private httpService: HttpService,
        private httpStreamService: HttpStreamService,
        protected activeMeetingIdService: ActiveMeetingIdService,
        private communicationManager: CommunicationManagerService,
        private httpEndpointService: HttpStreamEndpointService
    ) {}

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
        console.log(`${this.serviceDescription}: Connect to ICC service with: meeting_id=${meetingId}`);
        if (!meetingId) {
            throw new Error(`Cannot connect to ICC, no meeting ID was provided`);
        }

        if (!this.receivePath) {
            throw new Error(`Cannot connect to ICC, no path was provided`);
        }

        this.disconnect();

        const iccMeeting = `${ICC_PATH}${this.receivePath}?meeting_id=${meetingId}`;
        this.httpEndpointService.registerEndpoint(ICC_ENDPOINT, iccMeeting, this.healthPath, HttpMethod.GET);
        const buildStreamFn = () =>
            this.httpStreamService.create<ICCResponseType>(ICC_ENDPOINT, {
                onMessage: (response: ICCResponseType) => this.onMessage(response),
                description: this.serviceDescription
            });
        const { closeFn } = this.communicationManager.registerStreamBuildFn(buildStreamFn);
        this.connectionClosingFn = closeFn;
    }

    public disconnect(): void {
        if (this.connectionClosingFn) {
            try {
                this.connectionClosingFn();
            } catch (e) {
                console.warn(`Was not able to properly close previous ICC connection: `, e);
            }
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
}
