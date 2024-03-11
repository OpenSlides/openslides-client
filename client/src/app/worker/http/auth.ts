import { Id } from 'src/app/domain/definitions/key-types';
import { environment } from 'src/environments/environment';

export class WorkerHttpAuth {
    private static subscriptions: Map<string, (token: string, newUserId?: Id) => void> = new Map();
    private static workerHttpAuth: WorkerHttpAuth | null = null;

    public static subscribe(id: string, callback: (token: string, newUserId?: Id) => void): void {
        this.subscriptions.set(id, callback);

        if (!this.workerHttpAuth) {
            this.workerHttpAuth = new WorkerHttpAuth();
        } else {
            this.workerHttpAuth.notifyUserChange(id);
        }
    }

    public static unsubscribe(id: string): void {
        this.subscriptions.delete(id);

        if (!this.subscriptions.size) {
            this.workerHttpAuth.destroy();
            this.workerHttpAuth = null;
        }
    }

    public static async currentToken(): Promise<string> {
        if (this.workerHttpAuth?.updateAuthPromise) {
            await this.workerHttpAuth?.updateAuthPromise;
        }

        return this.workerHttpAuth?.authToken || ``;
    }

    public static async currentUser(): Promise<number> {
        if (this.workerHttpAuth?.updateAuthPromise) {
            await this.workerHttpAuth?.updateAuthPromise;
        }

        return this.workerHttpAuth?.currentUserId || null;
    }

    /**
     * Updates the auth token
     */
    public static async update(): Promise<boolean> {
        return this.workerHttpAuth && (await this.workerHttpAuth.updateAuthentication());
    }

    /**
     * Returns wether an auth update is in progress
     */
    public static async updating(): Promise<boolean> | undefined {
        return this.workerHttpAuth && (await this.workerHttpAuth.updateAuthPromise);
    }

    public static stopRefresh(): void {
        if (this.workerHttpAuth) {
            clearTimeout(this.workerHttpAuth._authTokenRefreshTimeout);
            this.workerHttpAuth.updateAuthPromise = new Promise(r => r(false));
        }
    }

    /**
     * Only for usage in unit tests
     */
    public static reset(): void {
        this.subscriptions.clear();
        if (this.workerHttpAuth) {
            this.workerHttpAuth.destroy();
            this.workerHttpAuth = null;
        }
    }

    private currentUserId: number = undefined;
    private authToken: string = undefined;
    private updateAuthPromise: Promise<boolean> | undefined;

    private _authTokenRefreshTimeout: any | null = null;
    private _waitingForUpdateAuthPromise = false;

    constructor() {
        this.updateAuthentication();
    }

    private destroy(): void {
        clearTimeout(this._authTokenRefreshTimeout);
    }

    private async updateAuthentication(): Promise<boolean> {
        const currentPromise = this.updateAuthPromise;

        if (this._waitingForUpdateAuthPromise) {
            return await this.updateAuthPromise;
        }

        this.updateAuthPromise = new Promise(async resolve => {
            if (currentPromise) {
                this._waitingForUpdateAuthPromise = true;
                await currentPromise;
                this._waitingForUpdateAuthPromise = false;
            }

            try {
                clearTimeout(this._authTokenRefreshTimeout);
                const res = await fetch(`/${environment.authUrlPrefix}/who-am-i/`, {
                    method: `POST`,
                    headers: {
                        'ngsw-bypass': true
                    } as any
                });
                const json = await res.json();
                if (json?.success) {
                    this.setAuthToken(res.headers.get(`authentication`) || null);
                } else if (!res.ok && json?.message === `Not signed in`) {
                    this.setAuthToken(null);
                    resolve(false);
                    return;
                }
                resolve(true);
            } catch (e) {}
        });

        return await this.updateAuthPromise;
    }

    private setAuthToken(token: string | null): void {
        const lastUserId = this.currentUserId;
        this.authToken = token;

        for (const subscr of WorkerHttpAuth.subscriptions.keys()) {
            this.notifyTokenChange(subscr);
        }

        if (this.authToken) {
            const payload = atob(this.authToken.split(`.`)[1]);
            const token = JSON.parse(payload);
            const issuedAt = new Date().getTime(); // in ms
            const expiresAt = token.exp; // in sec
            this.currentUserId = token.userId;
            this._authTokenRefreshTimeout = setTimeout(() => {
                this.updateAuthentication();
            }, expiresAt * 1000 - issuedAt - 100); // 100ms before token is invalid
        } else {
            this.currentUserId = null;
        }

        if (lastUserId !== undefined && this.currentUserId !== lastUserId) {
            for (const subscr of WorkerHttpAuth.subscriptions.keys()) {
                this.notifyUserChange(subscr);
            }
        }
    }

    private notifyTokenChange(subscription: string) {
        WorkerHttpAuth.subscriptions.get(subscription)(this.authToken);
    }

    private notifyUserChange(subscription: string) {
        WorkerHttpAuth.subscriptions.get(subscription)(this.authToken, this.currentUserId);
    }
}
