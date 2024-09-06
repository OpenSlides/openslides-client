import {WorkerMessage, WorkerMessageContent} from './interfaces';

export interface ICCDisconnectParams {
    type: string;
    meetingId: number;
}

export interface ICCDisconnectAction extends WorkerMessageContent {
    action: `disconnect`;
    params: ICCDisconnectParams;
}

export interface ICCDisconnectMessage extends WorkerMessage<ICCDisconnectAction> {
    receiver: 'icc';
    msg: ICCDisconnectAction;
}

export interface ICCConnectMessageContent extends WorkerMessageContent {
    action: `connect`;
    params: {
        type: string;
        meetingId: number;
    };
};

export interface ICCConnectMessage extends WorkerMessage<ICCConnectMessageContent> {
    receiver: 'icc';
    msg: ICCConnectMessageContent;
}

export type ICCMessage = ICCConnectMessage | ICCDisconnectMessage;
