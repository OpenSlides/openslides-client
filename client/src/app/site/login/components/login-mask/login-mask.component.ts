import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { AuthService } from 'app/core/core-services/auth.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { OrganizationService } from 'app/core/core-services/organization.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { SpinnerService } from 'app/core/ui-services/spinner.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ViewOrganization } from 'app/management/models/view-organization';
import { fadeInAnim } from 'app/shared/animations';
import { ParentErrorStateMatcher } from 'app/shared/parent-error-state-matcher';
import { BaseComponent } from 'app/site/base/components/base.component';
import { BrowserSupportService } from '../../services/browser-support.service';

const HttpWarning = _('Using OpenSlides over HTTP is not supported. Enable HTTPS to continue.');

/**
 * Login mask component.
 *
 * Handles user and guest login
 */
@Component({
    selector: 'os-login-mask',
    templateUrl: './login-mask.component.html',
    styleUrls: ['./login-mask.component.scss'],
    animations: [fadeInAnim]
})
export class LoginMaskComponent extends BaseComponent implements OnInit, OnDestroy {
    public get meeting(): ViewMeeting | null {
        return this._meeting;
    }

    public get organization(): ViewOrganization | null {
        return this._organization;
    }

    /**
     * Show or hide password and change the indicator accordingly
     */
    public hide: boolean;

    private checkBrowser = true;

    /**
     * Reference to the SnackBarEntry for the installation notice send by the server.
     */
    public installationNotice: string;

    /**
     * Login Error Message if any
     */
    public loginErrorMsg = '';

    /**
     * Form group for the login form
     */
    public loginForm: FormGroup;

    /**
     * Custom Form validation
     */
    public parentErrorStateMatcher = new ParentErrorStateMatcher();

    public operatorSubscription: Subscription | null;

    public samlLoginButtonText: string | null = null;

    public guestsEnabled = false;

    /**
     * The message, that should appear, when the user logs in.
     */
    private loginMessage = 'Loading data. Please wait ...';

    private currentMeetingId: number | null = null;

    private _meeting: ViewMeeting | null = null;

    private _organization: ViewOrganization | null = null;

    /**
     * Constructor for the login component
     *
     * @param authService Authenticating the user
     * @param operator The representation of the current user
     * @param router forward to start page
     * @param formBuilder To build the form and validate
     * @param httpService used to get information before the login
     * @param OpenSlides The Service for OpenSlides
     * @param orgaSettings provide information about the legal notice and privacy policy
     * @param overlayService Service to show the spinner when the user is signing in
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private authService: AuthService,
        private operator: OperatorService,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private orgaService: OrganizationService,
        private orgaSettings: OrganizationSettingsService,
        private browserSupport: BrowserSupportService,
        private activeMeeting: ActiveMeetingService,
        private spinnerService: SpinnerService
    ) {
        super(componentServiceCollector);
        // Hide the spinner if the user is at `login-mask`
        this.createForm();
    }

    /**
     * Init.
     *
     * Set the title to "Log In"
     * Observes the operator, if a user was already logged in, recreate to user and skip the login
     */
    public ngOnInit(): void {
        this.subscriptions.push(
            this.orgaSettings.get('login_text').subscribe(notice => (this.installationNotice = notice)),
            this.activeMeeting.meetingObservable.subscribe(meeting => (this._meeting = meeting)),
            this.orgaService.organizationObservable.subscribe(organization => (this._organization = organization))
        );

        this.subscriptions
            .push // TODO: SAML
            // this.orgaSettings.get('saml').subscribe(
            //     samlSettings => (this.samlLoginButtonText = samlSettings ? samlSettings.loginButtonText : null)
            // )
            ();

        // Maybe the operator changes and the user is logged in. If so, redirect him and boot OpenSlides.
        this.operatorSubscription = this.operator.operatorUpdatedEvent.subscribe(() => {
            this.clearOperatorSubscription();
            this.authService.redirectUser(this.currentMeetingId);
        });

        this.route.queryParams.pipe(filter(params => params.checkBrowser)).subscribe(params => {
            this.checkBrowser = params.checkBrowser === 'true';
        });
        this.route.params.subscribe(params => {
            if (params.meetingId) {
                this.checkIfGuestsEnabled(params.meetingId);
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
    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.clearOperatorSubscription();
    }

    /**
     * Actual login function triggered by the form.
     *
     * Send username and password to the {@link AuthService}
     */
    public async formLogin(): Promise<void> {
        this.loginErrorMsg = '';
        try {
            this.spinnerService.show(this.loginMessage, { hideWhenStable: true });
            const { username, password }: { username: string; password: string } = this.loginForm.value;
            await this.authService.login(username, password, this.currentMeetingId);
        } catch (e) {
            this.spinnerService.hide();
            this.loginForm.get('password').setErrors({ notFound: true });
            this.loginErrorMsg = e;
        }
        // throw new Error('TODO'); // Ingore SAML for now...
    }

    public async guestLogin(): Promise<void> {
        this.router.navigate([`${this.currentMeetingId}/`]);
    }

    /**
     * Go to the reset password view
     */
    public resetPassword(): void {
        this.router.navigate(['./reset-password'], { relativeTo: this.route });
    }

    private checkForUnsecureConnection(): void {
        if (location.protocol === 'http:') {
            this.raiseWarning(this.translate.instant(HttpWarning));
        }
    }

    private checkIfGuestsEnabled(meetingId: string): void {
        this.currentMeetingId = Number(meetingId);
        this.meetingSettingService.get('enable_anonymous').subscribe(isEnabled => (this.guestsEnabled = isEnabled));
    }

    private checkDevice(): void {
        if (!this.browserSupport.isBrowserSupported()) {
            this.router.navigate(['./unsupported-browser'], { relativeTo: this.route });
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
    private createForm(): void {
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required, Validators.maxLength(128)]],
            password: ['', [Validators.required, Validators.maxLength(128)]]
        });
    }
}
