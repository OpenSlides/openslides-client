import { Id } from '../domain/definitions/key-types';
import { HttpMethod } from '../infrastructure/definitions/http';
import { WorkerMessage, WorkerMessageContent, WorkerResponse } from './interfaces';

export interface AutoupdateSetEndpointParams {
    url: string;
    healthUrl: string;
    method: HttpMethod;
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

export interface AutoupdateCloseStreamMessage extends WorkerMessage<AutoupdateCloseStream> {
    receiver: 'autoupdate';
}

export interface AutoupdateCleanupCacheParams {
    streamId: number;
    deletedFqids: string[];
}

export interface AutoupdateCleanupCache extends WorkerMessageContent {
    action: 'cleanup-cache';
    params: AutoupdateCleanupCacheParams;
}

export interface AutoupdateSetConnectionStatus extends WorkerMessageContent {
    action: 'set-connection-status';
    params: {
        status: 'online' | 'offline';
    };
}

export interface AutoupdateReconnectInactive extends WorkerMessageContent {
    action: 'reconnect-inactive';
}

export interface AutoupdateReconnectForce extends WorkerMessageContent {
    action: 'reconnect-force';
}

export interface AutoupdateWorkerResponse<C> extends WorkerResponse<C> {
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

export interface AutoupdateSetStreamId extends AutoupdateWorkerResponse<AutoupdateSetStreamIdContent> {
    action: 'set-streamid';
}

export interface AutoupdateReceiveDataContent {
    streamId: Id;
    data: any;
    streamIdDescriptions: { [streamId: number]: string };
}

export interface AutoupdateReceiveData extends AutoupdateWorkerResponse<AutoupdateReceiveDataContent> {
    action: 'receive-data';
}

export interface AutoupdateReceiveError extends AutoupdateWorkerResponse<AutoupdateReceiveDataContent> {
    action: 'receive-error';
}

export interface AutoupdateStatusContent {
    status: 'healthy' | 'unhealthy';
}

export interface AutoupdateStatus extends AutoupdateWorkerResponse<AutoupdateStatusContent> {
    action: 'status';
}

export interface AutoupdateOpenMessageContent extends WorkerMessageContent {
    action: 'open';
    params: AutoupdateOpenStreamParams;
}

export interface AutoupdateCloseMessageContent extends WorkerMessageContent {
    action: 'close';
    params: AutoupdateCloseStreamParams;
}

export interface AutoupdateCleanupCacheMessageContent extends WorkerMessageContent {
    action: 'cleanup-cache';
    params: AutoupdateCleanupCacheParams;
}

export interface AutoupdateSetEndpointMessageContent extends WorkerMessageContent {
    action: 'set-endpoint';
    params: AutoupdateSetEndpointParams;
}

export interface AutoupdateMessageType<T extends WorkerMessageContent> extends WorkerMessage<T> {
    receiver: 'autoupdate';
}

export interface AutoupdateOpenMessage extends AutoupdateMessageType<AutoupdateOpenMessageContent> {}

export interface AutoupdateCloseMessage extends AutoupdateMessageType<AutoupdateCloseMessageContent> {}

export interface AutoupdateCleanupCacheMessage extends AutoupdateMessageType<AutoupdateCleanupCacheMessageContent> {}

export interface AutoupdateSetEndpointMessage extends AutoupdateMessageType<AutoupdateSetEndpointMessageContent> {}

export interface AutoupdateSetConnectionStatusMessageContent extends WorkerMessageContent {
    action: 'set-connection-status';
}

export interface AutoupdateReconnectInactiveMessageContent extends WorkerMessageContent {
    action: 'reconnect-inactive';
}

export interface AutoupdateReconnectForceMessageContent extends WorkerMessageContent {
    action: 'reconnect-force';
}

export interface AutoupdateEnableDebugMessageContent extends WorkerMessageContent {
    action: 'enable-debug';
}

export interface AutoupdateSetAuthTokenMessageContent extends WorkerMessageContent {
    action: 'set-auth-token';
    params: {
        token: string;
    };
}

export interface AutoupdateSetConnectionStatusMessage
    extends AutoupdateMessageType<AutoupdateSetConnectionStatusMessageContent> {}

export interface AutoupdateReconnectInactiveMessage
    extends AutoupdateMessageType<AutoupdateReconnectInactiveMessageContent> {}

export interface AutoupdateReconnectForceMessage
    extends AutoupdateMessageType<AutoupdateReconnectForceMessageContent> {}

export interface AutoupdateEnableDebugMessage extends AutoupdateMessageType<AutoupdateEnableDebugMessageContent> {}

export interface AutoupdateSetAuthTokenMessage extends AutoupdateMessageType<AutoupdateSetAuthTokenMessageContent> {}

export type AutoupdateMessage =
    | AutoupdateOpenMessage
    | AutoupdateCloseMessage
    | AutoupdateCleanupCacheMessage
    | AutoupdateSetEndpointMessage
    | AutoupdateSetConnectionStatusMessage
    | AutoupdateReconnectInactiveMessage
    | AutoupdateReconnectForceMessage
    | AutoupdateEnableDebugMessage
    | AutoupdateSetAuthTokenMessage;
