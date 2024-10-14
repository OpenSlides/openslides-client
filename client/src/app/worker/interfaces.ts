export const SW_BROADCAST_CHANNEL_NAME = `os_shared_worker_channel`;

export interface WorkerMessage<C extends WorkerMessageContent> {
    receiver?: string;
    msg: C;
    nonce?: string | number;
}

export interface WorkerMessageContent {
    action: string;
    params?: any;
}

export interface WorkerResponse<C> {
    sender: string;
    action: string;
    content?: C;
}

export type Broadcaster = (sender: string, action: string, content?: any) => void;

/**
 * Overwrite MessagePort interface for more type safety
 */
export interface OsMessagePort extends Omit<MessagePort, 'postMessage'> {
    postMessage(message: WorkerResponse<any>): void;
}
