import { Component, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { getOmlVerboseName } from 'src/app/domain/definitions/organization-permission';
import { largeDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { AuthService } from 'src/app/site/services/auth.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ThemeService } from 'src/app/site/services/theme.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { AccountDialogComponent } from '../account-dialog/account-dialog.component';

@Component({
    selector: `os-account-button`,
    templateUrl: `./account-button.component.html`,
    styleUrls: [`./account-button.component.scss`]
})
export class AccountButtonComponent extends BaseUiComponent implements OnInit {
    @ViewChild(`languageTrigger`, { read: MatMenuTrigger })
    public set languageTrigger(trigger: MatMenuTrigger | undefined) {
        this._languageTrigger = trigger;
    }

    public get isPresent(): boolean {
        return this.hasActiveMeeting && this.operator.isInMeeting(this.activeMeetingId)
            ? this.user.isPresentInMeeting()
            : false;
    }

    public get isAllowedSelfSetPresent(): boolean {
        return this._isAllowedSelfSetPresent && this.operator.isInMeeting(this.activeMeetingId);
    }

    public get isOnProfilePage(): boolean {
        return true;
    }

    public get hasActiveMeeting(): boolean {
        return this.activeMeetingId !== null;
    }

    public get isDarkModeActiveObservable(): Observable<boolean> {
        return this.theme.isDarkModeObservable;
    }

    public user: ViewUser | null = null;
    public username = ``;
    public isLoggedIn = false;

    private get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    private _userId: Id | null | undefined = undefined; // to distinguish from null!
    private _userSubscription: Subscription | null = null;
    private _isAllowedSelfSetPresent = false;
    private _languageTrigger: MatMenuTrigger | undefined = undefined;

    public constructor(
        private translate: TranslateService,
        private operator: OperatorService,
        private userRepo: UserControllerService,
        private authService: AuthService,
        private dialog: MatDialog,
        private router: Router,
        private theme: ThemeService,
        private meetingSettingsService: MeetingSettingsService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private controller: UserControllerService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.operator.operatorUpdated.subscribe(() => this.onOperatorUpdate());

        this.meetingSettingsService
            .get(`users_allow_self_set_present`)
            .subscribe(allowed => (this._isAllowedSelfSetPresent = allowed));

        this.onOperatorUpdate(); // initially trigger the update manually to set initial values
    }

    public getCurrentLanguageName(): string {
        return this.getLanguageName(this.translate.currentLang);
    }

    /**
     * Get the name of a Language by abbreviation.
     *
     * @param abbreviation The abbreviation of the languate or null, if the current
     * language should be used.
     */
    public getLanguageName(abbreviation: string): string {
        if (abbreviation === `en`) {
            return `English`;
        } else if (abbreviation === `de`) {
            return `Deutsch`;
        } else if (abbreviation === `cs`) {
            return `Čeština`;
        } else if (abbreviation === `it`) {
            return `Italiano`;
        } else if (abbreviation === `es`) {
            return `Español`;
        } else if (abbreviation === `ru`) {
            return `русский`;
        }
        return `No language`;
    }

    public selectLanguage(abbreviation: string): void {
        this.translate.use(abbreviation).subscribe();
    }

    public toggleOperatorPresence(): void {
        this.controller
            .setPresent({
                isPresent: !this.isPresent,
                meetingId: this.activeMeetingId,
                users: [this.user!]
            })
            .resolve();
    }

    public openAccountDialog(): void {
        this.dialog.open(AccountDialogComponent, {
            ...largeDialogSettings,
            height: `530px`
        });
    }

    public async login(): Promise<void> {
        this.router.navigate([`/`, this.activeMeetingId, `login`]);
    }

    public async logout(): Promise<void> {
        await this.authService.logout();
    }

    public closeLanguageMenu(): void {
        this._languageTrigger?.closeMenu();
    }

    public getOmlVerboseName(): string {
        return getOmlVerboseName(this.user!.organization_management_level);
    }

    public toggleDarkMode(buttonEvent: Event): void {
        buttonEvent.preventDefault();
        buttonEvent.stopPropagation();
        this.theme.toggleDarkMode();
    }

    public getStructureLevel(): string {
        if (this.user) {
            if (this.hasActiveMeeting) {
                return this.user.structure_level();
            } else {
                return this.user.default_structure_level;
            }
        }
        return ``;
    }

    private onOperatorUpdate(): void {
        this.isLoggedIn = !this.operator.isAnonymous;
        this.username = this.isLoggedIn ? this.operator.shortName : this.translate.instant(`Guest`);
        const userId = this.operator.operatorId;
        if (this._userId !== userId) {
            this._userId = userId;
            this.doUserUpdate();
        }
    }

    private doUserUpdate(): void {
        if (!this._userId) {
            this.user = null;
            return;
        }

        if (this._userSubscription) {
            this._userSubscription.unsubscribe();
        }
        this._userSubscription = this.userRepo.getViewModelObservable(this._userId).subscribe(user => {
            if (user !== undefined) {
                this.user = user;
            }
        });
    }
}
