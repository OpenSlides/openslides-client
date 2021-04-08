import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from 'app/core/core-services/auth.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { AuthType, UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { OverlayService } from 'app/core/ui-services/overlay.service';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';

@Component({
    selector: 'os-user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent extends BaseModelContextComponent implements OnInit {
    public isLoggedIn: boolean;

    public user: ViewUser;

    public username = '';

    public samlChangePasswordUrl: string | null = null;

    public allowSelfSetPresent: boolean;

    public authType: AuthType = 'default';

    public get isPresent(): boolean {
        return this.user.isPresentInMeeting();
    }

    @Output()
    private navEvent: EventEmitter<void> = new EventEmitter();

    private _userId: number | null = undefined; // to distinguish from null!

    private userSubscription: Subscription | null = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private operator: OperatorService,
        private authService: AuthService,
        private overlayService: OverlayService,
        private orgaSettings: OrganisationSettingsService,
        private router: Router,
        private userRepo: UserRepositoryService,
        private meetingsSettingsService: MeetingSettingsService
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

        this.meetingsSettingsService
            .get('users_allow_self_set_present')
            .subscribe(allowed => (this.allowSelfSetPresent = allowed));

        this.onOperatorUpdate(); // initially trigger the update manually to set initial values
    }

    private onOperatorUpdate(): void {
        this.isLoggedIn = !this.operator.isAnonymous;
        this.username = this.isLoggedIn ? this.operator.shortName : this.translate.instant('Guest');
        const userId = this.operator.operatorId;
        if (this._userId !== userId) {
            this._userId = userId;
            this.userUpdate();
        }
    }

    private userUpdate(): void {
        if (!this._userId) {
            this.user = null;
            return;
        }

        this.requestModels({
            viewModelCtor: ViewUser,
            ids: [this._userId],
            fieldset: ['is_present_in_meeting_ids']
        });

        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
        this.userSubscription = this.userRepo.getViewModelObservable(this._userId).subscribe(user => {
            if (user !== undefined) {
                this.user = user;
            }
        });
    }

    public isOnProfilePage(): boolean {
        if (!this.user) {
            return false;
        }
        const ownProfilePageUrl = `/users/${this.user.id}`;
        return ownProfilePageUrl === this.router.url;
    }

    public isOnChangePasswordPage(): boolean {
        const changePasswordPageUrl = '/users/password';
        return changePasswordPageUrl === this.router.url;
    }

    /**
     * Let the user change the language
     * @param lang the desired language (en, de, cs, ...)
     */
    public selectLang(selection: string): void {
        this.translate.use(selection).subscribe();
    }

    /**
     * Get the name of a Language by abbreviation.
     *
     * @param abbreviation The abbreviation of the languate or null, if the current
     * language should be used.
     */
    public getLangName(abbreviation?: string): string {
        if (!abbreviation) {
            abbreviation = this.translate.currentLang;
        }

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

    public toggleUserIsPresent(): void {
        this.userRepo.setPresent(this.user, !this.isPresent);
    }

    public onClickNavEntry(): void {
        this.navEvent.next();
    }

    /**
     * Function to log out the current user
     */
    public logout(): void {
        this.authService.logout();
        this.overlayService.logout();
    }
}
