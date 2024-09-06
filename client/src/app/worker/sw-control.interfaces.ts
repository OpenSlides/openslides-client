import { WorkerMessage, WorkerMessageContent, WorkerResponse } from './interfaces';

interface ControlPingMessageContent extends WorkerMessageContent {
    action: 'ping';
}

export interface ControlPingMessage extends WorkerMessage<ControlPingMessageContent> {
    receiver: 'control';
    msg: ControlPingMessageContent;
}

export interface ControlTerminateMessageContent extends WorkerMessageContent {
    action: 'terminate';
}

export interface ControlTerminateMessage extends WorkerMessage<ControlTerminateMessageContent> {
    receiver: 'control';
    msg: ControlTerminateMessageContent;
}

export interface ControlTerminateRejected extends WorkerResponse {
    action: 'terminate-rejected';
    sender: 'control';
}

export interface ControlAcknowledgement extends WorkerResponse {
    action: 'ack';
    sender: 'control';
    content: string | number;
}

export interface ControlPong extends WorkerResponse {
    action: 'pong';
    sender: 'control';
    content: any;
}

export type ControlMessage = ControlPingMessage | ControlTerminateMessage;
