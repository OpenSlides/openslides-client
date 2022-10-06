import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpService } from 'src/app/gateways/http.service';
import { HttpStreamEndpointService, HttpStreamService } from 'src/app/gateways/http-stream';
import { CommunicationManagerService } from 'src/app/site/services/communication-manager.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ActiveMeetingIdService } from '../site/pages/meetings/services/active-meeting-id.service';
import { BaseICCGatewayService } from './base-icc-gateway.service';

/**
 * Encapslates the name and content of every message regardless of being a request or response.
 */
interface NotifyBase<T> {
    /**
     * The name of the notify message.
     */
    name: string;

    /**
     * The content to send.
     */
    message: T;
}

/**
 * This interface has all fields for a notify request to the server. Next to name and content
 * one can give an array of user ids (or the value `true` for all users) and an array of
 * channel names.
 */
export interface NotifyRequest<T> extends NotifyBase<T> {
    channel_id: string;
    to_all?: boolean;

    /**
     * Targeted Meeting as MeetingID
     */
    to_meeting?: number;

    /**
     * User ids (or `true` for all users) to send this message to.
     */
    to_users?: number[];

    /**
     * An array of channels to send this message to.
     */
    to_channels?: string[];
}

/**
 * This is the notify-format one recieves from the server.
 */
export interface NotifyResponse<T> extends NotifyBase<T> {
    /**
     * This is the channel name of the one, who sends this message. Can be use to directly
     * answer this message.
     */
    sender_channel_id: string;

    /**
     * The user id of the user who sends this message. It is 0 for Anonymous.
     */
    sender_user_id: number;

    /**
     * This is validated here and is true, if the senderUserId matches the current operator's id.
     * It's also true, if one recieves a request from an anonymous and the operator itself is the anonymous.
     */
    sendByThisUser: boolean;
}

interface ChannelIdResponse {
    channel_id: string;
}

/**
 * @param name The name of the notify message
 * @param message The payload to send.
 * @param users Either an array of IDs or `true` meaning of sending this message to all online users clients.
 * @param channels An array of channels to send this message to.
 */
interface NotifySendOptions<T> {
    name: string;
    message: T;
    toAll?: boolean;
    users?: number[];
    channels?: string[];
}

@Injectable({
    providedIn: `root`
})
export class NotifyService extends BaseICCGatewayService<ChannelIdResponse | NotifyResponse<any>> {
    protected readonly serviceDescription = `NotifyService`;

    protected readonly receivePath = `/notify`;
    protected readonly sendPath = `${this.receivePath}/publish`;

    /**
     * A general subject for all messages.
     */
    private notifySubject = new Subject<NotifyResponse<any>>();

    /**
     * Subjects for specific messages.
     */
    private messageSubjects: {
        [name: string]: Subject<NotifyResponse<any>>;
    } = {};

    private channelId: string = ``;

    /**
     * Constructor to create the NotifyService.
     */
    public constructor(
        httpService: HttpService,
        httpStreamService: HttpStreamService,
        private operator: OperatorService,
        activeMeetingIdService: ActiveMeetingIdService,
        communicationManager: CommunicationManagerService,
        httpEndpointService: HttpStreamEndpointService
    ) {
        super(httpService, httpStreamService, activeMeetingIdService, communicationManager, httpEndpointService);
        this.setupConnections();
    }

    /**
     * Returns a general observalbe of all notify messages.
     */
    public getObservable(): Observable<NotifyResponse<any>> {
        return this.notifySubject.asObservable();
    }

    /**
     * Returns an observable which gets updates for a specific topic.
     * @param name The name of a topic to subscribe to.
     */
    public getMessageObservable<T>(name: string): Observable<NotifyResponse<T>> {
        if (!this.messageSubjects[name]) {
            this.messageSubjects[name] = new Subject<NotifyResponse<any>>();
        }
        return this.messageSubjects[name].asObservable() as Observable<NotifyResponse<T>>;
    }

    /**
     * Sents a notify message to all users (so all clients that are online).
     * @param name The name of the notify message
     * @param content The payload to send
     */
    public async sendToAllUsers<T>(name: string, content: T): Promise<void> {
        await this.send(this.buildRequest({ name, message: content, toAll: true }));
    }

    /**
     * Sends a notify message to all open clients with the given users logged in.
     * @param name The name of the enotify message
     * @param content The payload to send.
     * @param users Multiple user ids.
     */
    public async sendToUsers<T>(name: string, content: T, ...users: number[]): Promise<void> {
        if (users.length < 1) {
            throw new Error(`You have to provide at least one user`);
        }
        await this.send(this.buildRequest({ name, message: content, users }));
    }

    /**
     * Sends a notify message to all given channels.
     * @param name The name of th enotify message
     * @param content The payload to send.
     * @param channels Multiple channels to send this message to.
     */
    public async sendToChannels<T>(name: string, content: T, ...channels: string[]): Promise<void> {
        if (channels.length < 1) {
            throw new Error(`You have to provide at least one channel`);
        }
        await this.send(this.buildRequest({ name, message: content, channels }));
    }

    protected onMessage(message: ChannelIdResponse | NotifyResponse<any>): void {
        console.log(`onMessage`, message);
        if ((message as ChannelIdResponse).channel_id) {
            this.handleChannelIdResponse(message as ChannelIdResponse);
        } else {
            this.handleNotifyResponse(message as NotifyResponse<any>);
        }
    }

    private buildRequest<T>(data: NotifySendOptions<T>): NotifyRequest<T> {
        if (!this.channelId) {
            throw new Error(`${this.serviceDescription}: Can't send '${data.name}': no channel_id.`)
        }
        const notify: NotifyRequest<T> = {
            name: data.name,
            message: data.message,
            channel_id: this.channelId,
            to_meeting: this.activeMeetingIdService.meetingId!
        };
        if (data.toAll === true) {
            notify.to_all = true;
        }
        if (data.users) {
            notify.to_users = data.users;
        }
        if (data.channels) {
            notify.to_channels = data.channels;
        }
        return notify;
    }

    private handleChannelIdResponse(response: ChannelIdResponse): void {
        this.channelId = response.channel_id;
    }

    private handleNotifyResponse(notify: NotifyResponse<any>): void {
        notify = notify as NotifyResponse<any>;

        notify.sendByThisUser = notify.sender_user_id === this.operator.operatorId || false;
        this.notifySubject.next(notify);
        if (this.messageSubjects[notify.name]) {
            this.messageSubjects[notify.name].next(notify);
        }
    }
}
