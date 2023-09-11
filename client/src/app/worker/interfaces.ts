export const SW_BROADCAST_CHANNEL_NAME = `os_shared_worker_channel`;

export interface WorkerMessage {
    receiver: string;
    msg: WorkerMessageContent;
    nonce?: string | number;
}

export interface WorkerMessageContent {
    action: string;
}

export interface WorkerResponse {
    sender: string;
    action: string;
    content: any;
}
