import { Id } from '../../domain/definitions/key-types';
import { WorkerMessageContent } from '../interfaces';

export interface AutoupdateSetEndpointParams {
    url: string;
    healthUrl: string;
    method: string;
}

export interface AutoupdateSetEndpoint extends WorkerMessageContent {
    action: 'set-endpoint';
    params: AutoupdateSetEndpointParams;
}

export interface AutoupdateOpenStreamParams {
    streamId?: number | null;
    description?: string | null;
    queryParams?: string;
    requestHash: string;
    request: any;
}

export interface AutoupdateOpenStream extends WorkerMessageContent {
    action: 'open';
    params: AutoupdateOpenStreamParams;
}

export interface AutoupdateCloseStreamParams {
    streamId?: number | null;
}

export interface AutoupdateCloseStream extends WorkerMessageContent {
    action: 'close';
    params: AutoupdateCloseStreamParams;
}

export interface AutoupdateCleanupCacheParams {
    streamId: number;
    deletedFqids: string[];
}

export interface AutoupdateCleanupCache extends WorkerMessageContent {
    action: 'cleanup-cache';
    params: AutoupdateCleanupCacheParams;
}

export interface AutoupdateSetConnectionStatusParams {
    status: 'online' | 'offline';
}

export interface AutoupdateSetConnectionStatus extends WorkerMessageContent {
    action: 'set-connection-status';
    params: AutoupdateSetConnectionStatusParams;
}

export interface AutoupdateReconnectInactive extends WorkerMessageContent {
    action: 'reconnect-inactive';
}

export interface AutoupdateReconnectForce extends WorkerMessageContent {
    action: 'reconnect-force';
}

export interface AutoupdateWorkerResponse {
    sender: 'autoupdate';
    action: string;
}

export interface AutoupdateSetStreamIdContent {
    requestHash: string;
    streamId: Id;
}

export interface AutoupdateAuthChangeParams {
    type: 'login' | 'logout';
}

export interface AutoupdateAuthChange extends WorkerMessageContent {
    action: 'auth-change';
    params: AutoupdateAuthChangeParams;
}

export interface AutoupdateSetStreamId extends AutoupdateWorkerResponse {
    action: 'set-streamid';
    content: AutoupdateSetStreamIdContent;
}

export interface AutoupdateReceiveDataContent {
    streamId: Id;
    data: any;
    description: string;
}

export interface AutoupdateReceiveData extends AutoupdateWorkerResponse {
    action: 'receive-data';
    content: AutoupdateReceiveDataContent;
}

export interface AutoupdateReceiveError extends AutoupdateWorkerResponse {
    action: 'receive-error';
    content: AutoupdateReceiveDataContent;
}

export interface AutoupdateStatusContent {
    status: 'healthy' | 'unhealthy';
}

export interface AutoupdateStatus extends AutoupdateWorkerResponse {
    action: 'status';
    content: AutoupdateStatusContent;
}

export interface AutoupdateNewUserContent {
    id: number;
}

export interface AutoupdateNewUser extends AutoupdateWorkerResponse {
    action: 'new-user';
    content: AutoupdateNewUserContent;
}
