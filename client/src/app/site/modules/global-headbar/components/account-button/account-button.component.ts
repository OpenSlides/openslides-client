import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { allAvailableTranslations, availableTranslations } from 'src/app/domain/definitions/languages';
import { getOmlVerboseName } from 'src/app/domain/definitions/organization-permission';
import { largeDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { AuthService } from 'src/app/site/services/auth.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ThemeService } from 'src/app/site/services/theme.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { ChessDialogComponent } from 'src/app/ui/modules/sidenav/modules/easter-egg/modules/chess-dialog/components/chess-dialog/chess-dialog.component';
import { ChessChallengeService } from 'src/app/ui/modules/sidenav/modules/easter-egg/modules/chess-dialog/services/chess-challenge.service';

import { AccountDialogComponent } from '../account-dialog/account-dialog.component';

@Component({
    selector: `os-account-button`,
    templateUrl: `./account-button.component.html`,
    styleUrls: [`./account-button.component.scss`]
})
export class AccountButtonComponent extends BaseUiComponent implements OnInit {
    public readonly translations = availableTranslations;

    @ViewChild(`languageTrigger`, { read: MatMenuTrigger })
    public set languageTrigger(trigger: MatMenuTrigger | undefined) {
        this._languageTrigger = trigger;
        this._langTriggerSubscription?.unsubscribe();
        this._langTriggerSubscription = this._languageTrigger?.menuClosed.subscribe(() => {
            if (this.show1337 < 0) {
                this.show1337 = -20;
            }
        });
    }

    private _langTriggerSubscription: Subscription;

    public get isPresent(): boolean {
        return this.hasActiveMeeting && this.operator.isInMeeting(this.activeMeetingId) && !this.operator.isAnonymous
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

    public get user(): ViewUser {
        return this.operator.user;
    }

    public username = ``;
    public isLoggedIn = false;

    public show1337 = -20;

    private get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    private _isAllowedSelfSetPresent = false;
    private _languageTrigger: MatMenuTrigger | undefined = undefined;
    private clickCounter = 0;
    private clickTimeout: number | null = null;

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
        chessChallengeService: ChessChallengeService
    ) {
        super();
        chessChallengeService.startListening();
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
        return allAvailableTranslations[abbreviation] || `No language`;
    }

    public selectLanguage(abbreviation: string): void {
        this.translate.use(abbreviation);
    }

    public toggleOperatorPresence(): void {
        this.userRepo
            .setPresent({
                isPresent: !this.isPresent,
                meetingId: this.activeMeetingId,
                users: [this.user]
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
        await this.authService.logoutAnonymous();
        if (this.activeMeetingId) {
            this.router.navigate([`/`, this.activeMeetingId, `login`]);
        } else {
            this.router.navigate([`/`, `login`]);
        }
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

        this.clickCounter++;
        if (this.clickTimeout) {
            clearTimeout(<any>this.clickTimeout);
        }

        if (this.clickCounter === 4) {
            this.clickCounter = 0;
            const config: MatDialogConfig = mediumDialogSettings;
            const match = this.router.url.match(/.*\/participants\/(\d+)\/?$/);
            if (match) {
                config.data = { userId: +match[1] };
            }
            this.dialog.open(ChessDialogComponent, config);
        } else {
            this.clickTimeout = <any>setTimeout(() => {
                this.clickCounter = 0;
            }, 200);
        }
    }

    public getStructureLevel(): string {
        return ``;
    }

    public onLangIconClick(): void {
        this.show1337++;
    }

    protected override cleanSubscriptions(): void {
        this._langTriggerSubscription?.unsubscribe();
        super.cleanSubscriptions();
    }

    private onOperatorUpdate(): void {
        this.isLoggedIn = !this.operator.isAnonymous;
        this.username = this.operator.shortName;
    }
}
