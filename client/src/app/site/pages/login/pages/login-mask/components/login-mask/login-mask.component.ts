import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { filter, Observable, Subscription } from 'rxjs';
import { fadeInAnim } from 'src/app/infrastructure/animations';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { OrganizationService } from 'src/app/site/pages/organization/services/organization.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { AuthService } from 'src/app/site/services/auth.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ParentErrorStateMatcher } from 'src/app/ui/modules/search-selector/validators';

import { MeetingComponentServiceCollectorService } from '../../../../../meetings/services/meeting-component-service-collector.service';
import { BrowserSupportService } from '../../../../services/browser-support.service';

const HTTP_WARNING = _(`Using OpenSlides over HTTP is not supported. Enable HTTPS to continue.`);

interface LoginValues {
    username: string;
    password: string;
}

@Component({
    selector: `os-login-mask`,
    templateUrl: `./login-mask.component.html`,
    styleUrls: [`./login-mask.component.scss`],
    animations: [fadeInAnim]
})
export class LoginMaskComponent extends BaseMeetingComponent implements OnInit, OnDestroy {
    public get meetingObservable(): Observable<ViewMeeting | null> {
        return this.activeMeetingService.meetingObservable;
    }

    public get organizationObservable(): Observable<ViewOrganization | null> {
        return this.orgaService.organizationObservable;
    }

    /**
     * Show or hide password and change the indicator accordingly
     */
    public hide: boolean = false;

    private checkBrowser = true;

    /**
     * Reference to the SnackBarEntry for the installation notice send by the server.
     */
    public installationNotice: string = ``;

    /**
     * Login Error Message if any
     */
    public loginErrorMsg = ``;

    /**
     * Form group for the login form
     */
    public loginForm: UntypedFormGroup;

    /**
     * Custom Form validation
     */
    public parentErrorStateMatcher = new ParentErrorStateMatcher();

    public operatorSubscription: Subscription | null = null;

    public samlLoginButtonText: string | null = null;

    public guestsEnabled = false;

    public isWaitingOnLogin = false;

    /**
     * The message, that should appear, when the user logs in.
     */
    private loginMessage = `Loading data. Please wait ...`;

    private currentMeetingId: number | null = null;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private authService: AuthService,
        private operator: OperatorService,
        private route: ActivatedRoute,
        private formBuilder: UntypedFormBuilder,
        private orgaService: OrganizationService,
        private orgaSettings: OrganizationSettingsService,
        private browserSupport: BrowserSupportService // private spinnerService: SpinnerService
    ) {
        super(componentServiceCollector, translate);
        // Hide the spinner if the user is at `login-mask`
        this.loginForm = this.createForm();
    }

    /**
     * Init.
     *
     * Set the title to "Log In"
     * Observes the operator, if a user was already logged in, recreate to user and skip the login
     */
    public ngOnInit(): void {
        this.subscriptions.push(
            this.orgaSettings.get(`login_text`).subscribe(notice => (this.installationNotice = notice))
        );

        // Maybe the operator changes and the user is logged in. If so, redirect him and boot OpenSlides.
        this.operatorSubscription = this.operator.operatorUpdated.subscribe(() => {
            this.clearOperatorSubscription();
            this.authService.redirectUser(this.currentMeetingId);
        });

        this.route.queryParams.pipe(filter(params => params[`checkBrowser`])).subscribe(params => {
            this.checkBrowser = params[`checkBrowser`] === `true`;
        });
        this.route.params.subscribe(params => {
            if (params[`meetingId`]) {
                this.checkIfGuestsEnabled(params[`meetingId`]);
            }
        });

        if (this.checkBrowser) {
            this.checkDevice();
        }

        this.checkForUnsecureConnection();
    }

    /**
     * Clear the subscription on destroy.
     */
    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.clearOperatorSubscription();
    }

    /**
     * Actual login function triggered by the form.
     *
     * Send username and password to the {@link AuthService}
     */
    public async formLogin(): Promise<void> {
        this.isWaitingOnLogin = true;
        this.loginErrorMsg = ``;
        try {
            // this.spinnerService.show(this.loginMessage, { hideWhenStable: true });
            const { username, password } = this.formatLoginInputValues(this.loginForm.value);
            await this.authService.login(username, password, this.currentMeetingId);
        } catch (e: any) {
            this.isWaitingOnLogin = false;
            // this.spinnerService.hide();
            this.loginErrorMsg = `${this.translate.instant(`Error`)}: ${e.message}`;
        }
    }

    public async guestLogin(): Promise<void> {
        this.router.navigate([`${this.currentMeetingId}/`]);
    }

    /**
     * Go to the reset password view
     */
    public resetPassword(): void {
        this.router.navigate([`./forget-password`], { relativeTo: this.route });
    }

    private formatLoginInputValues(info: LoginValues): LoginValues {
        const newName = info.username.trim();
        return { username: newName, password: info.password };
    }

    private checkForUnsecureConnection(): void {
        if (location.protocol === `http:`) {
            this.raiseWarning(this.translate.instant(HTTP_WARNING));
        }
    }

    private checkIfGuestsEnabled(meetingId: string): void {
        this.currentMeetingId = Number(meetingId);
        this.meetingSettingsService.get(`enable_anonymous`).subscribe(isEnabled => (this.guestsEnabled = isEnabled));
    }

    private checkDevice(): void {
        if (!this.browserSupport.isBrowserSupported()) {
            this.router.navigate([`./unsupported-browser`], { relativeTo: this.route });
        }
    }

    /**
     * Clears the subscription to the operator.
     */
    private clearOperatorSubscription(): void {
        if (this.operatorSubscription) {
            this.operatorSubscription.unsubscribe();
            this.operatorSubscription = null;
        }
    }

    /**
     * Create the login Form
     */
    private createForm(): UntypedFormGroup {
        return this.formBuilder.group({
            username: [``, [Validators.required, Validators.maxLength(128)]],
            password: [``, [Validators.required, Validators.maxLength(128)]]
        });
    }
}
