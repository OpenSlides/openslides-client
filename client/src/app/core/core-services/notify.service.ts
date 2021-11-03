import { Injectable } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';

import { HTTPMethod } from '../definitions/http-methods';
import { ActiveMeetingIdService } from './active-meeting-id.service';
import { CommunicationManagerService } from './communication-manager.service';
import { HttpService } from './http.service';
import { HttpStreamService } from './http-stream.service';
import { HttpStreamEndpointService } from './http-stream-endpoint.service';
import { LifecycleService } from './lifecycle.service';
import { OperatorService } from './operator.service';

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

const ICC_ENDPOINT = `icc`;

const iccPath = `/system/icc`;
const notifyPath = `${iccPath}/notify`;
const publishPath = `${notifyPath}/publish`;
const iccHealthPath = `${iccPath}/health`;

/**
 * Handles all incoming and outgoing notify messages via {@link WebsocketService}.
 */
@Injectable({
    providedIn: `root`
})
export class NotifyService {
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

    private channelId: string;
    private commCloseFn: () => void;

    /**
     * Constructor to create the NotifyService. Registers itself to the WebsocketService.
     * @param websocketService
     */
    public constructor(
        private httpService: HttpService,
        private httpStreamService: HttpStreamService,
        private operator: OperatorService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private lifecycleService: LifecycleService,
        private commManager: CommunicationManagerService,
        private httpEndpointService: HttpStreamEndpointService
    ) {
        /**
         * watch for both the meeting ID and lifecycle
         * enables logging out to be anonymous ICC and
         * re-logging in to a new ICC channel without a hazzle
         */
        combineLatest([
            this.activeMeetingIdService.meetingIdObservable,
            this.lifecycleService.openslidesBooted
        ]).subscribe(([meetingId]) => {
            if (meetingId) {
                this.connect(meetingId);
            } else {
                this.disconnect();
            }
        });
    }

    private async connect(meetingId: number): Promise<void> {
        if (!meetingId) {
            throw new Error(`Cannot connect to ICC, no meeting ID was provided`);
        }

        this.disconnect();

        const iccMeeting = `${notifyPath}?meeting_id=${meetingId}`;
        this.httpEndpointService.registerEndpoint(ICC_ENDPOINT, iccMeeting, iccHealthPath, HTTPMethod.GET);
        const httpStream = this.httpStreamService.create<NotifyResponse<any> | ChannelIdResponse>(ICC_ENDPOINT, {
            onMessage: (notify: NotifyResponse<any> | ChannelIdResponse) => {
                if ((notify as ChannelIdResponse).channel_id) {
                    this.handleChannelIdResponse(notify as ChannelIdResponse);
                } else {
                    this.handleNotifyResponse(notify as NotifyResponse<any>);
                }
            },
            description: `NotifyService`
        });
        this.commCloseFn = this.commManager.registerStream(httpStream);
    }

    private disconnect(): void {
        if (this.commCloseFn) {
            try {
                this.commCloseFn();
            } catch (e) {
                console.warn(`Was not able to properly close previous ICC connection: `, e);
            }
            this.commCloseFn = undefined;
        }
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

    /**
     * Sents a notify message to all users (so all clients that are online).
     * @param name The name of the notify message
     * @param content The payload to send
     */
    public async sendToAllUsers<T>(name: string, content: T): Promise<void> {
        await this.send(name, content, true);
    }

    /**
     * Sends a notify message to all open clients with the given users logged in.
     * @param name The name of th enotify message
     * @param content The payload to send.
     * @param users Multiple user ids.
     */
    public async sendToUsers<T>(name: string, content: T, ...users: number[]): Promise<void> {
        if (users.length < 1) {
            throw new Error(`You have to provide at least one user`);
        }
        await this.send(name, content, false, users);
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
        await this.send(name, content, false, null, channels);
    }

    /**
     * General send function for notify messages.
     * @param name The name of the notify message
     * @param message The payload to send.
     * @param users Either an array of IDs or `true` meaning of sending this message to all online users clients.
     * @param channels An array of channels to send this message to.
     */
    private async send<T>(
        name: string,
        message: T,
        toAll?: boolean,
        users?: number[],
        channels?: string[]
    ): Promise<void> {
        if (!this.channelId) {
            throw new Error(`No channel id!`);
        }

        const notify: NotifyRequest<T> = {
            name,
            message,
            channel_id: this.channelId,
            to_meeting: this.activeMeetingIdService.meetingId
        };

        if (toAll === true) {
            notify.to_all = true;
        }
        if (users) {
            notify.to_users = users;
        }
        if (channels) {
            notify.to_channels = channels;
        }

        await this.httpService.post<unknown>(publishPath, notify);
    }

    /**
     * Returns a general observalbe of all notify messages.
     */
    public getObservable(): Observable<NotifyResponse<any>> {
        return this.notifySubject.asObservable();
    }

    /**
     * Returns an observable for a specific type of messages.
     * @param name The name of all messages to observe.
     */
    public getMessageObservable<T>(name: string): Observable<NotifyResponse<T>> {
        if (!this.messageSubjects[name]) {
            this.messageSubjects[name] = new Subject<NotifyResponse<any>>();
        }
        return this.messageSubjects[name].asObservable() as Observable<NotifyResponse<T>>;
    }
}
