import { AuthToken } from '../domain/interfaces/auth-token';
import { WorkerMessage, WorkerMessageContent } from './interfaces';

export interface AuthMessageType<T extends WorkerMessageContent> extends WorkerMessage<T> {
    receiver: 'auth';
}

export interface AuthStopRefreshMessageContent extends WorkerMessageContent {
    action: 'stop-refresh';
}

export interface AuthStopRefreshMessage extends AuthMessageType<AuthStopRefreshMessageContent> {}

export interface AuthGetCurrentAuthMessageContent extends WorkerMessageContent {
    action: 'get-current-auth';
}

export interface AuthGetCurrentAuthMessage extends AuthMessageType<AuthGetCurrentAuthMessageContent> {}

export interface AuthUpdateMessageContent extends WorkerMessageContent {
    action: 'update';
    params: AuthToken | null;
}

export interface AuthUpdateMessage extends AuthMessageType<AuthUpdateMessageContent> {}

export type AuthMessage = AuthStopRefreshMessage | AuthGetCurrentAuthMessage | AuthUpdateMessage;
