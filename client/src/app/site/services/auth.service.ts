import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SharedWorkerService } from 'src/app/openslides-main-module/services/shared-worker.service';

import { AuthToken } from '../../domain/interfaces/auth-token';
import { AuthAdapterService } from '../../gateways/auth-adapter.service';
import { ProcessError } from '../../infrastructure/errors';
import { UpdateService } from '../modules/site-wrapper/services/update.service';
import { AuthTokenService } from './auth-token.service';
import { DataStoreService } from './data-store.service';
import { LifecycleService } from './lifecycle.service';

@Injectable({
    providedIn: `root`
})
export class AuthService {
    public get authTokenObservable(): Observable<AuthToken | null> {
        return this._authTokenSubject;
    }

    public get authToken(): AuthToken | null {
        return this._authTokenSubject.getValue();
    }

    /**
     * "Pings" every time when a user logs out.
     */
    public get logoutObservable(): Observable<void> {
        return this._logoutEvent;
    }

    /**
     * "Pings" every time when a user logs in.
     */
    public get loginObservable(): Observable<void> {
        return this._loginEvent;
    }

    // This is a wrapper around authTokenService.accessTokenObservable
    // We need to control the point, when specific token changes should be propagated.
    // undefined is used to indicate, that there is no valid token yet
    private readonly _authTokenSubject = new BehaviorSubject<AuthToken | null>(null);
    private readonly _logoutEvent = new EventEmitter<void>();
    private readonly _loginEvent = new EventEmitter<void>();

    public constructor(
        private lifecycleService: LifecycleService,
        private router: Router,
        private authAdapter: AuthAdapterService,
        private authTokenService: AuthTokenService,
        private sharedWorker: SharedWorkerService,
        private updateService: UpdateService,
        private DS: DataStoreService
    ) {
        this.authTokenService.accessTokenObservable.subscribe(token => {
            this._authTokenSubject.next(token);
        });

        this.sharedWorker.listenTo(`auth`).subscribe(msg => {
            switch (msg?.action) {
                case `new-user`:
                    this.authTokenService.setRawAccessToken(msg.content?.token);
                    this.updateUser(msg.content?.user);
                    break;
                case `new-token`:
                    this.authTokenService.setRawAccessToken(msg.content?.token);
                    break;
            }
        });
    }

    /**
     * Signs in to OpenSlides. Username and password are not necessary, if a current meeting allows guests.
     * Then, a meeting-id is required.
     *
     * @param username
     * @param password
     * @param meetingId Optional. A meeting-id can be given to signs in to a specific meeting.
     * Required, if anyone signs in as guest.
     */
    public async login(username: string, password: string, meetingId: number | null = null): Promise<void> {
        try {
            const response = await this.authAdapter.login({ username, password });
            if (response?.success) {
                // Shutdowning kills all connections. The operator is listening for token changes, so
                // we must hold them back to this point.
                this._loginEvent.emit();
                this.lifecycleService.reboot();
                this.sharedWorker.sendMessage(`auth`, { action: `update` });
                this.redirectUser(meetingId);
            }
        } catch (e) {
            throw e;
        }
    }

    public async startSamlLogin(): Promise<string> {
        return this.authAdapter.startSamlLogin();
    }

    public redirectUser(meetingId: number | null): void {
        if (this.isAuthenticated()) {
            const baseRoute = meetingId ? `${meetingId}/` : `/`;
            if (this.updateService.updateAvailable) {
                const baseUrl = this.router.serializeUrl(this.router.createUrlTree([baseRoute]));
                location.href = baseUrl;
            } else {
                this.router.navigate([baseRoute]);
            }
        }
    }

    public async updateUser(userId: number): Promise<void> {
        if (userId) {
            this._loginEvent.emit();
            this.lifecycleService.reboot();
            this.redirectUser(null);
        } else {
            this.lifecycleService.shutdown();
            this.authTokenService.setRawAccessToken(null);
            this._logoutEvent.emit();
            await this.DS.clear();
            this.lifecycleService.bootup();
        }
    }

    public async invalidateSessionAfter(callback: () => Promise<any>): Promise<void> {
        try {
            const response = await callback();
            if (response?.success) {
                this.authTokenService.setRawAccessToken(null);
                this._logoutEvent.emit();
                this.sharedWorker.sendMessage(`auth`, { action: `update` });
                this.DS.deleteCollections(...this.DS.getCollections());
                await this.DS.clear();
                this.lifecycleService.bootup();
            }
        } catch (e) {
            this.sharedWorker.sendMessage(`auth`, { action: `update` });
            throw e;
        }
    }

    public async logout(): Promise<void> {
        this.lifecycleService.shutdown();
        const response = await this.authAdapter.logout();
        if (response?.success) {
            this.authTokenService.setRawAccessToken(null);
        }
        this._logoutEvent.emit();
        this.sharedWorker.sendMessage(`auth`, { action: `update` });
        this.DS.deleteCollections(...this.DS.getCollections());
        await this.DS.clear();
        this.lifecycleService.bootup();
    }

    public isAuthenticated(): boolean {
        return !!this.authTokenService.accessToken;
    }

    /**
     * Calls `/system/auth/who-am-i` to find out the real operator.
     *
     * @returns true, if the request was successful (=online)
     */
    public async doWhoAmIRequest(): Promise<boolean> {
        console.log(`auth: Do WhoAmI`);
        let online: boolean;
        try {
            await this.authAdapter.whoAmI();
            online = true;
        } catch (e) {
            if (e instanceof ProcessError && e.status >= 400 && e.status < 500) {
                online = true;
            } else {
                online = false;
            }
        }
        console.log(`auth: WhoAmI done, online:`, online, `authenticated:`, !!this.authTokenService.accessToken);
        return online;
    }
}
