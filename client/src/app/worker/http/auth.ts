import { Id } from 'src/app/domain/definitions/key-types';
import { environment } from 'src/environments/environment';

export class WorkerHttpAuth {
    private serverTimeOffset = 0;
    private static subscriptions = new Map<string, (token: string, newUserId?: Id) => void>();
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

    public constructor() {
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
                    const date = new Date(res.headers.get(`Date`));
                    if (res.headers.get(`Date`) && !isNaN(date.valueOf())) {
                        const clientTime = date.getTime();
                        this.serverTimeOffset = Math.floor(Date.now() - clientTime);
                    } else {
                        this.serverTimeOffset = 0;
                    }

                    const authHeader = res.headers.get(`authentication`);
                    if (authHeader) {
                        // Legacy auth: token in header
                        this.setAuthToken(authHeader);
                    } else if (json.user_id) {
                        // OIDC mode: user_id in response, no token to manage
                        this.setOidcUser(json.user_id);
                    } else {
                        // Anonymous
                        this.setAuthToken(null);
                    }
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
            const issuedAt = Date.now() - this.serverTimeOffset; // in ms
            const expiresAt = token.exp; // in sec
            this.currentUserId = token.userId;
            this._authTokenRefreshTimeout = setTimeout(
                () => {
                    this.updateAuthentication();
                },
                expiresAt * 1000 - issuedAt - 100
            ); // 100ms before token is invalid
        } else {
            this.currentUserId = null;
        }

        if (lastUserId !== undefined && this.currentUserId !== lastUserId) {
            for (const subscr of WorkerHttpAuth.subscriptions.keys()) {
                this.notifyUserChange(subscr);
            }
        }
    }

    private setOidcUser(userId: number): void {
        const lastUserId = this.currentUserId;
        this.authToken = null;
        this.currentUserId = userId;

        // TODO: needs work.. auth token handling should be separated from OIDC mode logic
        for (const subscr of WorkerHttpAuth.subscriptions.keys()) {
            this.notifyTokenChange(subscr);
        }

        // In OIDC mode, Traefik handles token refresh
        // Periodic check to verify session validity.
        // This might not be required if we have stable backchannel logout.
        // TODO: refactor this to play well with the other refresh/update timers, conceptionally needs work
        clearTimeout(this._authTokenRefreshTimeout);
        this._authTokenRefreshTimeout = setTimeout(() => {
            this.updateAuthentication();
        }, 5 * 60 * 1000); // 5 minutes

        if (lastUserId !== undefined && this.currentUserId !== lastUserId) {
            for (const subscr of WorkerHttpAuth.subscriptions.keys()) {
                this.notifyUserChange(subscr);
            }
        }
    }

    private notifyTokenChange(subscription: string): void {
        WorkerHttpAuth.subscriptions.get(subscription)(this.authToken);
    }

    private notifyUserChange(subscription: string): void {
        WorkerHttpAuth.subscriptions.get(subscription)(this.authToken, this.currentUserId);
    }
}
