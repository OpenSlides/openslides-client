import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { filter, Observable, Subscription } from 'rxjs';
import { Meeting } from 'src/app/domain/models/meetings/meeting';
import { fadeInAnim } from 'src/app/infrastructure/animations';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ORGANIZATION_ID, OrganizationService } from 'src/app/site/pages/organization/services/organization.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';
import { AuthService } from 'src/app/site/services/auth.service';
import { AutoupdateService } from 'src/app/site/services/autoupdate';
import { ModelRequestBuilderService } from 'src/app/site/services/model-request-builder';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ParentErrorStateMatcher } from 'src/app/ui/modules/search-selector/validators';

import { BrowserSupportService } from '../../../../services/browser-support.service';

const HTTP_WARNING = _(`Using OpenSlides over HTTP is not supported. Enable HTTPS to continue.`);
const HTTP_H1_WARNING = _(
    `Using OpenSlides over HTTP 1.1 or lower is not supported. Make sure you can use HTTP 2 to continue.`
);

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
    public meeting: Meeting;

    public get organizationObservable(): Observable<ViewOrganization | null> {
        return this.orgaService.organizationObservable;
    }

    /**
     * Show or hide password and change the indicator accordingly
     */
    public hide = false;

    public loginAreaExpanded = false;

    private checkBrowser = true;

    /**
     * Reference to the SnackBarEntry for the installation notice send by the server.
     */
    public installationNotice = ``;

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

    public samlEnabled = true;

    public guestsEnabled = false;

    public isWaitingOnLogin = false;

    public loading = true;

    /**
     * The message, that should appear, when the user logs in.
     */
    private loginMessage = `Loading data. Please wait ...`;

    private currentMeetingId: number | null = null;
    private guestMeetingId: number | null = null;

    public constructor(
        protected override translate: TranslateService,
        private authService: AuthService,
        private autoupdate: AutoupdateService,
        private modelRequestBuilder: ModelRequestBuilderService,
        private operator: OperatorService,
        private route: ActivatedRoute,
        private osRouter: OpenSlidesRouterService,
        private formBuilder: UntypedFormBuilder,
        private orgaService: OrganizationService,
        private orgaSettings: OrganizationSettingsService,
        private browserSupport: BrowserSupportService // private spinnerService: SpinnerService
    ) {
        super();
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
            if (this.authService.isAuthenticated()) {
                this.osRouter.navigateAfterLogin(this.currentMeetingId);
            }
        });

        this.route.queryParams.pipe(filter(params => params[`checkBrowser`])).subscribe(params => {
            this.checkBrowser = params[`checkBrowser`] === `true`;
        });
        this.route.params.subscribe(params => {
            if (params[`meetingId`]) {
                this.loadMeeting(params[`meetingId`]);
            } else {
                this.loadActiveMeetings();
            }
        });

        if (this.checkBrowser) {
            this.checkDevice();
        }

        // check if global saml auth is enabled
        this.subscriptions.push(
            this.orgaSettings.getSafe(`saml_enabled`).subscribe(enabled => {
                this.samlEnabled = enabled;
                this.loading = false;
            }),
            this.orgaSettings.get(`saml_login_button_text`).subscribe(text => {
                this.samlLoginButtonText = text;
            })
        );

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
            await this.authService.login(username, password);
        } catch (e: any) {
            this.isWaitingOnLogin = false;
            // this.spinnerService.hide();
            this.loginErrorMsg = `${this.translate.instant(`Error`)}: ${this.translate.instant(e.message)}`;
        }
    }

    public async guestLogin(): Promise<void> {
        await this.authService.anonLogin();
        this.osRouter.navigateAfterLogin(this.currentMeetingId || this.guestMeetingId);
    }

    public async samlLogin(): Promise<void> {
        const redirectUrl = await this.authService.startSamlLogin();
        location.replace(redirectUrl);
    }

    /**
     * Go to the reset password view
     */
    public resetPassword(): void {
        this.router.navigate([`./forget-password`], { relativeTo: this.route });
    }

    public toggleLoginAreaExpansion(): void {
        this.loginAreaExpanded = !this.loginAreaExpanded;
    }

    public setLoginAreaExpansion(expanded: boolean): void {
        this.loginAreaExpanded = expanded;
    }

    private formatLoginInputValues(info: LoginValues): LoginValues {
        const newName = info.username.trim();
        return { username: newName, password: info.password };
    }

    private checkForUnsecureConnection(): void {
        const protocol = (<any>performance.getEntriesByType(`navigation`)[0]).nextHopProtocol;
        if (location.protocol === `http:`) {
            this.raiseWarning(this.translate.instant(HTTP_WARNING));
        } else if (protocol && protocol !== `h2` && protocol !== `h3`) {
            this.raiseWarning(this.translate.instant(HTTP_H1_WARNING));
        }
    }

    private async loadMeeting(meetingId: string): Promise<void> {
        this.currentMeetingId = Number(meetingId);
        const resp = await this.autoupdate.single(
            await this.modelRequestBuilder.build({
                ids: [this.currentMeetingId],
                viewModelCtor: ViewMeeting,
                fieldset: [`enable_anonymous`, `name`]
            }),
            `meeting_login`
        );
        if (!resp || !resp[`meeting`] || !resp[`meeting`][this.currentMeetingId]) {
            return;
        }

        this.meeting = new Meeting(resp[`meeting`][this.currentMeetingId]);
        this.guestsEnabled = this.meeting.enable_anonymous;
    }

    private async loadActiveMeetings(): Promise<void> {
        const resp = await this.autoupdate.single(
            await this.modelRequestBuilder.build({
                ids: [ORGANIZATION_ID],
                viewModelCtor: ViewOrganization,
                follow: [{ idField: `active_meeting_ids`, fieldset: [`enable_anonymous`] }]
            }),
            `meeting_login`
        );
        if (!resp || !resp[`meeting`]) {
            return;
        }
        const publicMeetings = Object.values(resp[`meeting`]).filter(m => m[`enable_anonymous`]);

        this.guestsEnabled = !!publicMeetings.length;
        if (publicMeetings.length === 1) {
            this.guestMeetingId = publicMeetings[0][`id`];
        }
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
