import { Directive } from "@angular/core";

import { HttpMethod } from "../infrastructure/definitions/http";
import { CommunicationManagerService } from "../site/services/communication-manager.service";
import { HttpService } from "./http.service";
import { HttpStreamEndpointService, HttpStreamService } from "./http-stream";

const ICC_ENDPOINT = `icc`;

export const ICC_PATH = `/system/icc`;

export interface ICCRequest<T> {}

export interface ICCSendOptions<T> {}

/**
 * Base sorting service with main functionality for sorting.
 *
 * Extends sorting services to sort with a consistent function.
 */
@Directive()
export abstract class BaseICCGatewayService<ICCResponseType> {

    private connectionClosingFn: (() => void) | undefined;

    protected abstract readonly serviceDescription: string;

    protected abstract readonly healthPath: string;
    protected abstract readonly receivePath: string;
    protected abstract readonly sendPath: string;

    /**
     * Constructor to create the Service.
     */
    public constructor(
        private httpService: HttpService,
        private httpStreamService: HttpStreamService,
        private communicationManager: CommunicationManagerService,
        private httpEndpointService: HttpStreamEndpointService
    ) {}

    public async connect(meetingId: number): Promise<void> {
        console.log(`Connect to ICC service with: meeting_id=${meetingId}`);
        if (!meetingId) {
            throw new Error(`Cannot connect to ICC, no meeting ID was provided`);
        }

        this.disconnect();

        const iccMeeting = `${this.receivePath}?meeting_id=${meetingId}`;
        console.log(`LOG: made path: `, iccMeeting);
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
        console.log(`LOG: disconnecting1`);
        if (this.connectionClosingFn) {
            console.log(`LOG: disconnecting2`);
            try {
                this.connectionClosingFn();
            } catch (e) {
                console.warn(`Was not able to properly close previous ICC connection: `, e);
            }
            this.connectionClosingFn = undefined;
        }
    }

    protected abstract onMessage(response: ICCResponseType): void;

    protected abstract buildRequest<T>(data: ICCSendOptions<T>): ICCRequest<T>;

    /**
     * General send function for messages. Subclasses should call this to build their own specific send functions
     */
    protected async send<T>(data?: ICCSendOptions<T>): Promise<void> {
        if (data){
            const request = this.buildRequest(data);
            console.debug(`Send following data over ICC:`, this.sendPath, request);
            await this.httpService.post<unknown>(this.sendPath, request);
        } else {
            console.debug(`Send following data over ICC:`, this.sendPath);
            await this.httpService.post<unknown>(this.sendPath);
        }
    }
}
