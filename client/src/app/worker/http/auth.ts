import { Id } from 'src/app/domain/definitions/key-types';
import { AuthToken } from 'src/app/domain/interfaces/auth-token';

import { Deferred } from '../../infrastructure/utils/promises';
import { AuthErrorReason, AuthStatus } from '../sw-auth.interfaces';

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
            this.workerHttpAuth = null;
        }
    }

    public static async currentToken(): Promise<string> {
        if (this.workerHttpAuth?.authStatus) {
            await this.workerHttpAuth?.authStatus;
        }

        return this.workerHttpAuth?.accessToken || ``;
    }

    public static async currentUser(): Promise<number> {
        return this.workerHttpAuth?.currentUserId || null;
    }

    /**
     * Returns whether an auth update is in progress
     */
    public static async updating(): Promise<boolean> {
        if(!this.workerHttpAuth?.authStatus) {
            return false;
        }
        return !!(await this.workerHttpAuth.authStatus);
    }

    /**
     * Updates the auth token
     */
    public static update(token: AuthToken | null): boolean {
        console.log(`WorkerHttpAuth.update`, token?.rawAccessToken);
        this.workerHttpAuth.setAuthToken(token?.rawAccessToken);
        return !!this.workerHttpAuth;
    }

    public static authError(reason: AuthErrorReason): void {
        if (this.workerHttpAuth) {
            this.workerHttpAuth.setAuthToken(null);
            this.workerHttpAuth.authStatus?.resolve(reason);
        }
    }

    public static async waitForAuthStatus(): Promise<AuthStatus> {
        if (!this.workerHttpAuth) {
            throw new Error(`WorkerHttpAuth not initialized`);
        }

        if (!this.workerHttpAuth.authStatus) {
            this.workerHttpAuth.authStatus = new Deferred<AuthStatus>();
            // set timer to resolve the deferred after 5 seconds
            setTimeout(() => {
                if (this.workerHttpAuth.authStatus) {
                    this.workerHttpAuth.authStatus.resolve(`update-expired`);
                }
            }, 5000);
        }

        return this.workerHttpAuth.authStatus;
    }

    private currentUserId: number = undefined;
    private accessToken: string = undefined;
    private authStatus?: Deferred<AuthStatus>;

    public constructor() {}

    private setAuthToken(accessToken: string | null): void {
        const lastUserId = this.currentUserId;
        this.accessToken = accessToken;

        if (accessToken && this.authStatus) {
            this.authStatus.resolve(`token-refreshed`);
        }

        for (const subscr of WorkerHttpAuth.subscriptions.keys()) {
            this.notifyTokenChange(subscr);
        }

        if (lastUserId !== undefined && this.currentUserId !== lastUserId) {
            for (const subscr of WorkerHttpAuth.subscriptions.keys()) {
                this.notifyUserChange(subscr);
            }
        }
    }

    private notifyTokenChange(subscription: string): void {
        WorkerHttpAuth.subscriptions.get(subscription)(this.accessToken);
    }

    private notifyUserChange(subscription: string): void {
        WorkerHttpAuth.subscriptions.get(subscription)(this.accessToken, this.currentUserId);
    }
}
