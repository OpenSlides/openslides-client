import { WorkerMessage, WorkerMessageContent } from './interfaces';

export interface AuthStopRefreshMessageContent extends WorkerMessageContent {
    action: 'stop-refresh';
}

export interface AuthStopRefreshMessage extends WorkerMessage<AuthStopRefreshMessageContent> {
    receiver: 'auth';
    msg: AuthStopRefreshMessageContent;
}

export interface AuthGetCurrentAuthMessageContent extends WorkerMessageContent {
    action: 'get-current-auth';
}

export interface AuthGetCurrentAuthMessage extends WorkerMessage<AuthGetCurrentAuthMessageContent> {
    receiver: 'auth';
    msg: AuthGetCurrentAuthMessageContent;
}

export type AuthMessage = AuthStopRefreshMessage | AuthGetCurrentAuthMessage;
