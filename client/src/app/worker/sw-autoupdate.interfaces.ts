import {
    AutoupdateCleanupCacheParams,
    AutoupdateCloseStreamParams,
    AutoupdateOpenStreamParams,
    AutoupdateSetEndpointParams
} from './autoupdate/interfaces-autoupdate';
import { WorkerMessage, WorkerMessageContent } from './interfaces';

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

export interface AutoupdateOpenMessage extends WorkerMessage<AutoupdateOpenMessageContent> {
    receiver: 'autoupdate';
    msg: AutoupdateOpenMessageContent;
}

export interface AutoupdateCloseMessage extends WorkerMessage<AutoupdateCloseMessageContent> {
    receiver: 'autoupdate';
    msg: AutoupdateCloseMessageContent;
}

export interface AutoupdateCleanupCacheMessage extends WorkerMessage<AutoupdateCleanupCacheMessageContent> {
    receiver: 'autoupdate';
    msg: AutoupdateCleanupCacheMessageContent;
}

export interface AutoupdateSetEndpointMessage extends WorkerMessage<AutoupdateSetEndpointMessageContent> {
    receiver: 'autoupdate';
    msg: AutoupdateSetEndpointMessageContent;
}

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
    extends WorkerMessage<AutoupdateSetConnectionStatusMessageContent> {
    receiver: 'autoupdate';
    msg: AutoupdateSetConnectionStatusMessageContent;
}

export interface AutoupdateReconnectInactiveMessage extends WorkerMessage<AutoupdateReconnectInactiveMessageContent> {
    receiver: 'autoupdate';
    msg: AutoupdateReconnectInactiveMessageContent;
}

export interface AutoupdateReconnectForceMessage extends WorkerMessage<AutoupdateReconnectForceMessageContent> {
    receiver: 'autoupdate';
    msg: AutoupdateReconnectForceMessageContent;
}

export interface AutoupdateEnableDebugMessage extends WorkerMessage<AutoupdateEnableDebugMessageContent> {
    receiver: 'autoupdate';
    msg: AutoupdateEnableDebugMessageContent;
}

export interface AutoupdateSetAuthTokenMessage extends WorkerMessage<AutoupdateSetAuthTokenMessageContent> {
    receiver: 'autoupdate';
    msg: AutoupdateSetAuthTokenMessageContent;
}

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
