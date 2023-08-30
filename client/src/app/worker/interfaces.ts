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
