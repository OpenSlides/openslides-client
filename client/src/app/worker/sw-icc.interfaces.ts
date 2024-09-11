import { WorkerMessage, WorkerMessageContent } from './interfaces';

export const ICC_ENDPOINT = `icc`;

interface ICCMessageType<T extends WorkerMessageContent> extends WorkerMessage<T> {
    receiver: 'icc';
}

export interface ICCDisconnectParams {
    type: string;
    meetingId: number;
}

export interface ICCDisconnectAction extends WorkerMessageContent {
    action: `disconnect`;
    params: ICCDisconnectParams;
}

export interface ICCDisconnectMessage extends ICCMessageType<ICCDisconnectAction> {}

export interface ICCConnectMessageContent extends WorkerMessageContent {
    action: `connect`;
    params: {
        type: string;
        meetingId: number;
    };
}

export interface ICCConnectMessage extends ICCMessageType<ICCConnectMessageContent> {}

export type ICCMessage = ICCConnectMessage | ICCDisconnectMessage;
