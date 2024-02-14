export interface HttpSubscriptionEndpoint {
    url: string;
    method: 'POST' | 'GET';
    payload?: string;
    authToken?: string;
}

export interface HttpSubscriptionCallbacks {
    onData: (data: unknown) => void;
    onError: (error: unknown) => void;
}

export abstract class HttpSubscription {
    constructor(protected endpoint: HttpSubscriptionEndpoint, protected callbacks: HttpSubscriptionCallbacks) {}

    protected _active = false;
    public get active(): boolean {
        return this._active;
    }

    public set authToken(token: string) {
        this.endpoint.authToken = token;
    }

    public abstract start(): Promise<void>;
    public abstract stop(): Promise<void>;
    public abstract restart(): Promise<void>;
}
