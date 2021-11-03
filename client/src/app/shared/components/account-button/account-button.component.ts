import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';

import { Subscription, Observable } from 'rxjs';

import { AuthService } from 'app/core/core-services/auth.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { AccountDialogComponent } from 'app/management/components/account-dialog/account-dialog.component';
import { largeDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { Router } from '@angular/router';
import { getOmlVerboseName } from '../../../core/core-services/organization-permission';
import { ThemeService } from '../../../core/ui-services/theme.service';

@Component({
    selector: 'os-account-button',
    templateUrl: './account-button.component.html',
    styleUrls: ['./account-button.component.scss']
})
export class AccountButtonComponent extends BaseModelContextComponent implements OnInit {
    @ViewChild('languageTrigger', { read: MatMenuTrigger })
    public set languageTrigger(trigger: MatMenuTrigger | undefined) {
        this._languageTrigger = trigger;
    }

    public get isPresent(): boolean {
        return this.user?.isPresentInMeeting();
    }

    public get isAllowedSelfSetPresent(): boolean {
        return this._isAllowedSelfSetPresent;
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
    public username = '';
    public isLoggedIn = false;

    private _userId: Id | null = undefined; // to distinguish from null!
    private _userSubscription: Subscription | null = null;
    private _isAllowedSelfSetPresent = false;
    private _languageTrigger: MatMenuTrigger | undefined = undefined;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private operator: OperatorService,
        private userRepo: UserRepositoryService,
        private authService: AuthService,
        private dialog: MatDialog,
        private router: Router,
        private theme: ThemeService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.operator.operatorUpdatedEvent.subscribe(() => this.onOperatorUpdate());

        // TODO: SAML
        // this.orgaSettings.get('saml').subscribe(
        //     samlSettings => (this.samlChangePasswordUrl = samlSettings ? samlSettings.changePasswordUrl : null)
        // );

        this.meetingSettingService
            .get('users_allow_self_set_present')
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
        if (abbreviation === 'en') {
            return 'English';
        } else if (abbreviation === 'de') {
            return 'Deutsch';
        } else if (abbreviation === 'cs') {
            return 'Čeština';
        } else if (abbreviation === 'ru') {
            return 'русский';
        }
    }

    public selectLanguage(abbreviation: string): void {
        this.translate.use(abbreviation).subscribe();
    }

    public toggleOperatorPresence(): void {
        this.userRepo.setPresent(!this.isPresent, this.user);
    }

    public openAccountDialog(): void {
        this.dialog.open(AccountDialogComponent, {
            ...largeDialogSettings,
            height: '530px'
        });
    }

    public async login(): Promise<void> {
        this.router.navigate(['/', this.activeMeetingId, 'login']);
    }

    public async logout(): Promise<void> {
        await this.authService.logout();
    }

    public closeLanguageMenu(): void {
        this._languageTrigger?.closeMenu();
    }

    public getOmlVerboseName(): string {
        return getOmlVerboseName(this.user?.organization_management_level);
    }

    public toggleDarkMode(buttonEvent: Event): void {
        buttonEvent.preventDefault();
        buttonEvent.stopPropagation();
        this.theme.toggleDarkMode();
    }

    private onOperatorUpdate(): void {
        this.isLoggedIn = !this.operator.isAnonymous;
        this.username = this.isLoggedIn ? this.operator.shortName : this.translate.instant('Guest');
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

        this.requestModels({
            viewModelCtor: ViewUser,
            ids: [this._userId],
            fieldset: 'shortName',
            additionalFields: [
                'is_present_in_meeting_ids',
                'can_change_own_password',
                'organization_management_level',
                { templateField: 'structure_level_$' },
                'default_structure_level'
            ]
        });

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
