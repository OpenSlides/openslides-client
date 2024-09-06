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

export interface WorkerResponse {
    sender: string;
    action: string;
    content?: any;
}

export type Broadcaster = (sender: string, action: string, content?: any) => void;
