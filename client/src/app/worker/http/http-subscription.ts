import { ErrorDescription, ErrorType, isCommunicationError } from 'src/app/gateways/http-stream/stream-utils';
import { HttpMethod } from 'src/app/infrastructure/definitions/http';

export interface HttpSubscriptionEndpoint {
    url: string;
    method: HttpMethod;
    payload?: string;
    authToken?: string;
    healthCheckUrl?: string;
}

export interface HttpSubscriptionCallbacks {
    onData?: (data: unknown) => void;
    onError?: (error: unknown) => void;
}

/**
 * Abstraction of a connection to a service which continiously publishes
 * new data.
 */
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

    protected parseErrorFromResponse(response: Response, content: any): ErrorDescription | null {
        let errorContent = null;
        if (content && (errorContent = content)?.error) {
            errorContent = errorContent.error;
        }

        let type = ErrorType.UNKNOWN;
        if ((response.status >= 400 && response.status < 500) || errorContent?.type === `invalid`) {
            type = ErrorType.CLIENT;
        } else if (response.status >= 500) {
            type = ErrorType.SERVER;
        }

        return {
            reason: `HTTP error`,
            type,
            error: isCommunicationError(errorContent)
                ? errorContent
                : {
                      type: `Communication error`,
                      msg: `Received non ok HTTP status ${response.status}`,
                      data: errorContent as unknown
                  }
        };
    }
}
