import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';

import { CommunicationManagerService } from './communication-manager.service';
import { DataStoreService } from './data-store.service';
import { LifecycleService } from './lifecycle.service';
import { OfflineBroadcastService, OfflineReason, OfflineReasonValue } from './offline-broadcast.service';
import { OperatorService, WhoAmI } from './operator.service';
import { StorageService } from './storage.service';

/**
 * Handles the bootup/showdown of this application.
 */
@Injectable({
    providedIn: 'root'
})
export class OpenSlidesService {
    /**
     * If the user tries to access a certain URL without being authenticated, the URL will be stored here
     */
    public redirectUrl: string;

    private _isBooted = false;
    /**
     * Saves, if OpenSlides is fully booted. This means, that a user must be logged in
     * (Anonymous is also a user in this case). This is the case after `afterLoginBootup`.
     */
    public get isBooted(): boolean {
        return this._isBooted;
    }

    public constructor(
        private operator: OperatorService,
        private router: Router,
        private DS: DataStoreService,
        private offlineBroadcastService: OfflineBroadcastService,
        private lifecycleService: LifecycleService
    ) {
        this.lifecycleService.appLoaded.subscribe(() => this.bootup());
    }

    /**
     * the bootup-sequence: Do a whoami request and if it was successful, do
     * {@method afterLoginBootup}. If not, redirect the user to the login page.
     */
    public async bootup(): Promise<void> {
        const response = await this.operator.doWhoAmIRequest();
        if (!response.online) {
            this.offlineBroadcastService.goOffline({
                type: OfflineReasonValue.WhoAmIFailed
            });
        }

        if (!this.operator.isAuthenticated) {
            if (!location.pathname.includes('error')) {
                this.redirectUrl = location.pathname;
            }
            this.redirectToLoginIfNotSubpage();
        } else {
            this.afterAuthenticatedBootup();
        }
    }

    /**
     * Redirects the user to /login, if he isn't on a subpage.
     */
    private redirectToLoginIfNotSubpage(): void {
        if (!this.redirectUrl || !this.redirectUrl.includes('/login/')) {
            // Goto login, if the user isn't on a subpage like
            // legal notice or reset passwort view.
            // If other routing requests are active (e.g. to `/` or `/error`)
            // wait for the authguard to finish to navigate to /login. This
            // redirect is more important than the other ones.
            setTimeout(() => {
                this.router.navigate(['/login']);
            });
        }
    }

    public afterAuthenticatedBootup(): void {
        this.DS.clear();
        this._isBooted = true;
        this.lifecycleService.openslidesBooted.next();
    }

    /**
     * Shuts down OpenSlides. The websocket connection is closed and the operator is not set.
     */
    public shutdown(): void {
        this._isBooted = false;
        this.lifecycleService.openslidesShutdowned.next();
    }

    /**
     * Shutdown and bootup.
     */
    public reboot(): void {
        this.shutdown();
        this.bootup();
    }

    public async checkWhoAmI(whoami: WhoAmI): Promise<void> {
        // User logged off.
        if (!whoami.user_id && !whoami.guest_enabled) {
            await this.shutdown();
            this.redirectToLoginIfNotSubpage();
        } else {
            console.warn('TODO: did the user change?');
            /*if (
                (this.operator.user && this.operator.user.id !== whoami.user_id) ||
                (!this.operator.user && whoami.user_id)
            ) {
                // user changed
                await this.DS.clear();
                await this.reboot();
            }*/
        }
    }
}
