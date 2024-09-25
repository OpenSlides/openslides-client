import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthEvent, OAuthService, OAuthSuccessEvent, TokenResponse } from 'angular-oauth2-oidc';
import { EventType } from 'angular-oauth2-oidc/events';
import { Observable } from 'rxjs';
import { SharedWorkerService } from 'src/app/openslides-main-module/services/shared-worker.service';

import { AuthAdapterService } from '../../gateways/auth-adapter.service';
import { authCodeFlowConfig } from '../../openslides-main-module/components/openslides-main/oidc-config';
import {
    AuthErrorMessage,
    AuthErrorReason,
    AuthUpdateMessage,
    AuthWorkerResponse
} from '../../worker/sw-auth.interfaces';
import { AuthTokenService } from './auth-token.service';
import { DataStoreService } from './data-store.service';
import { LifecycleService } from './lifecycle.service';

@Injectable({
    providedIn: `root`
})
export class AuthService {
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

    private readonly _logoutEvent = new EventEmitter<void>();
    private readonly _loginEvent = new EventEmitter<void>();

    public constructor(
        private lifecycleService: LifecycleService,
        private router: Router,
        private authAdapter: AuthAdapterService,
        private authTokenService: AuthTokenService,
        private sharedWorker: SharedWorkerService,
        private DS: DataStoreService,
        private oauthService: OAuthService
    ) {
        this.sharedWorker.listenTo<AuthWorkerResponse>(`auth`).subscribe(msg => {
            switch (msg?.action) {
                case `new-user`:
                    this.authTokenService.setRawAccessToken(msg.content?.token);
                    this.updateUser(msg.content?.user);
                    break;
                case `new-token`:
                    this.authTokenService.setRawAccessToken(msg.content?.token);
                    break;
                case `check-auth`:
                    console.log(`auth: Check auth`);
                    this.oauthService.silentRefresh();
                    break;
            }
        });
    }

    public async checkOnline(): Promise<boolean> {
        console.log(`auth: Do health check`);
        let online: boolean;
        try {
            await fetch(`system/autoupdate/health`);
            online = true;
        } catch (e) {
            online = false;
        }
        console.log(`auth: health check done, online:`, online, `authenticated:`, !!this.authTokenService.accessToken);
        return online;
    }

    /**
     * Signs in to OpenSlides. Username and password are not necessary, if a current meeting allows guests.
     * Then, a meeting-id is required.
     *
     * Required, if anyone signs in as guest.
     */
    public async login(): Promise<void> {
        try {
            // Shutdowning kills all connections. The operator is listening for token changes, so
            // we must hold them back to this point.
            this._loginEvent.emit();
            this.lifecycleService.reboot();
        } catch (e) {
            throw e;
        }
    }

    public async updateUser(userId: number): Promise<void> {
        if (userId) {
            this._loginEvent.emit();
            this.lifecycleService.reboot();
            this.router.navigate([`/`]);
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
                this.sharedWorker.sendMessage({
                    receiver: `auth`,
                    msg: { action: `update`, params: null }
                } as AuthUpdateMessage);
                this.DS.deleteCollections(...this.DS.getCollections());
                await this.DS.clear();
                this.lifecycleService.bootup();
            }
        } catch (e) {
            this.sharedWorker.sendMessage(<AuthUpdateMessage>{
                receiver: `auth`,
                msg: { action: `update`, params: null }
            });
            throw e;
        }
    }

    public async logout(): Promise<void> {
        this.lifecycleService.shutdown();
        this.authTokenService.setRawAccessToken(null);
        this._logoutEvent.emit();
        this.sharedWorker.sendMessage(<AuthUpdateMessage>{
            receiver: `auth`,
            msg: { action: `update`, params: null }
        });
        this.DS.deleteCollections(...this.DS.getCollections());
        await this.DS.clear();
        this.lifecycleService.bootup();
        // might do a redirect to the logout URL if configured
        this.oauthService.logOut();
    }

    public isAuthenticated(): boolean {
        return !!this.authTokenService.accessToken;
    }

    public async startOidcWorkflow(): Promise<void> {
        this.oauthService.events.subscribe(async event => {
            console.log(event.type);
            if (event.type === `token_received`) {
                this.propergateToken();
            } else if (event.type.indexOf(`error`) !== -1) {
                this.authTokenService.setRawAccessToken(null);
                this.sharedWorker.sendMessage(<AuthErrorMessage>{
                    receiver: `auth`,
                    msg: {
                        action: `auth-error`,
                        params: {
                            reason: AuthService.mapOidcErrorToAuthError(event.type)
                        }
                    }
                });
            }

            if (event.type.substring(event.type.length - `_error`.length) === `_error`) {
                console.error(`OAuth error: ${event.type}`, event);
                await this.logout();
            }
        });
        this.oauthService.configure(authCodeFlowConfig);
        await this.oauthService.loadDiscoveryDocumentAndLogin();
        this.oauthService.setupAutomaticSilentRefresh();
        this.allowRefreshTokenAndSilentRefreshOnMultipleTabs();
        if(this.oauthService.getAccessToken()) {
            this.propergateToken();
        }
    }

    /**
     * Taken from https://github.com/Alfresco/alfresco-ng2-components/commit/4c8e53d983df70f5a12ab5419c00f672643b3a4e
     * Fix a known issue (https://github.com/manfredsteyer/angular-oauth2-oidc/issues/850)
     * where multiple tabs can cause the token refresh and the silent refresh to fail.
     * This patch is based on the solutions provided in the following comments:
     * https://github.com/manfredsteyer/angular-oauth2-oidc/issues/850#issuecomment-889921776 fix silent refresh for the implicit flow
     * https://github.com/manfredsteyer/angular-oauth2-oidc/issues/850#issuecomment-1557286966 fix refresh token for the code flow
     */
    private allowRefreshTokenAndSilentRefreshOnMultipleTabs(): void {
        let lastUpdatedAccessToken: string | undefined;

        if (this.oauthService.hasValidAccessToken()) {
            lastUpdatedAccessToken = this.oauthService.getAccessToken();
        }

        const originalRefreshToken = this.oauthService.refreshToken.bind(this.oauthService);
        this.oauthService.refreshToken = (): Promise<TokenResponse> =>
            navigator.locks.request(`refresh_tokens_${location.origin}`, () => {
                if (!!lastUpdatedAccessToken && lastUpdatedAccessToken !== this.oauthService.getAccessToken()) {
                    (this.oauthService as any).eventsSubject.next(new OAuthSuccessEvent(`token_received`));
                    (this.oauthService as any).eventsSubject.next(new OAuthSuccessEvent(`token_refreshed`));
                    lastUpdatedAccessToken = this.oauthService.getAccessToken();
                    return;
                }

                return originalRefreshToken().then(resp => (lastUpdatedAccessToken = resp.access_token));
            });

        const originalSilentRefresh = this.oauthService.silentRefresh.bind(this.oauthService);
        this.oauthService.silentRefresh = async (params: any = {}, noPrompt = true): Promise<OAuthEvent> =>
            navigator.locks.request(`silent_refresh_${location.origin}`, async (): Promise<OAuthEvent> => {
                if (lastUpdatedAccessToken !== this.oauthService.getAccessToken()) {
                    (this.oauthService as any).eventsSubject.next(new OAuthSuccessEvent(`token_received`));
                    (this.oauthService as any).eventsSubject.next(new OAuthSuccessEvent(`token_refreshed`));
                    const event = new OAuthSuccessEvent(`silently_refreshed`);
                    (this.oauthService as any).eventsSubject.next(event);
                    lastUpdatedAccessToken = this.oauthService.getAccessToken();
                    return event;
                } else {
                    return originalSilentRefresh(params, noPrompt);
                }
            });
    }

    private static mapOidcErrorToAuthError(type: EventType): AuthErrorReason {
        switch (type) {
            case `discovery_document_load_error`:
            case `discovery_document_validation_error`:
                return `idp-unavailable`;
            case `token_error`:
            case `token_validation_error`:
                return `unknown`;
            case `token_refresh_error`:
                return `update-expired`;
            case `silent_refresh_error`:
                return `idp-unavailable`;
            case `session_changed`:
            case `session_error`:
            case `session_terminated`:
                return `session-expired`;
            default:
                return `unknown`;
        }
    }

    private propergateToken() {
        this.authTokenService.setRawAccessToken(this.oauthService.getAccessToken());
        this.sharedWorker.sendMessage(<AuthUpdateMessage>{
            receiver: `auth`,
            msg: { action: `update`, params: this.authTokenService.accessToken }
        });
    }
}
