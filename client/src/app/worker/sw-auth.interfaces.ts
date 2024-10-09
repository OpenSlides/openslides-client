import { AuthToken } from '../domain/interfaces/auth-token';
import { WorkerMessage, WorkerMessageContent, WorkerResponse } from './interfaces';

export interface AuthMessageType<T extends WorkerMessageContent> extends WorkerMessage<T> {
    receiver: 'auth';
}

export interface AuthUpdateMessageContent extends WorkerMessageContent {
    action: 'update';
    params: AuthToken | null;
}

export interface AuthUpdateMessage extends AuthMessageType<AuthUpdateMessageContent> {}

export type AuthErrorReason = 'session-expired' | 'idp-unavailable' | 'update-expired' | 'unknown';
export type AuthStatus = 'token-refreshed' | AuthErrorReason;

export interface AuthErrorMessageContent extends WorkerMessageContent {
    action: 'auth-error';
    params: { reason: AuthErrorReason };
}

export interface AuthErrorMessage extends AuthMessageType<AuthErrorMessageContent> {}

export type AuthMessage = AuthUpdateMessage | AuthErrorMessage;

type AuthNewUserOrTokenWorkerRepsonse = { token: string; user?: number };

export interface AuthNewUserWorkerResponse extends WorkerResponse<AuthNewUserOrTokenWorkerRepsonse> {
    sender: 'auth';
    action: 'new-user';
}

export interface AuthNewTokenWorkerResponse extends WorkerResponse<AuthNewUserOrTokenWorkerRepsonse> {
    sender: 'auth';
    action: 'new-token';
}

export interface AuthCheckMessage extends WorkerResponse<undefined> {
    sender: 'auth';
    action: 'check-auth';
}

export type AuthWorkerResponse = AuthNewTokenWorkerResponse | AuthNewUserWorkerResponse | AuthCheckMessage;
