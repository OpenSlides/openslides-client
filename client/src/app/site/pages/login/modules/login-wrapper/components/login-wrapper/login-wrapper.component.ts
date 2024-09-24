import { Component, OnInit } from '@angular/core';
import { BaseComponent } from 'src/app/site/base/base.component';
import {filter, Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {BrowserSupportService} from "../../../../services/browser-support.service";
import {MeetingSettingsService} from "../../../../../meetings/services/meeting-settings.service";
import {OperatorService} from "../../../../../../services/operator.service";
import {OpenSlidesRouterService} from "../../../../../../services/openslides-router.service";
import {AuthService} from "../../../../../../services/auth.service";

@Component({
    selector: `os-login-wrapper`,
    templateUrl: `./login-wrapper.component.html`,
    styleUrls: [`./login-wrapper.component.scss`]
})
export class LoginWrapperComponent extends BaseComponent implements OnInit {

    private checkBrowser = true;
    private currentMeetingId: number | null = null;

    public operatorSubscription: Subscription | null = null;
    public guestsEnabled = false;

    public constructor(private route: ActivatedRoute,
                       private operator: OperatorService,
                       private osRouter: OpenSlidesRouterService,
                       private meetingSettingsService: MeetingSettingsService,
                       private authService: AuthService,
                       private browserSupport: BrowserSupportService) {
        super();
    }

    /**
     * sets the title of the page
     */
    public ngOnInit(): void {
        super.setTitle(`Login`);

        this.route.queryParams.pipe(filter(params => params[`checkBrowser`])).subscribe(params => {
            this.checkBrowser = params[`checkBrowser`] === `true`;
        });

        this.route.params.subscribe(params => {
            if (params[`meetingId`]) {
                this.checkIfGuestsEnabled(params[`meetingId`]);
            }
        });

        // Maybe the operator changes and the user is logged in. If so, redirect him and boot OpenSlides.
        this.operatorSubscription = this.operator.operatorUpdated.subscribe(() => {
            debugger
            this.clearOperatorSubscription();
            this.osRouter.navigateAfterLogin(this.currentMeetingId);
        });

        if (this.checkBrowser) {
            this.checkDevice();
        }

        this.authService.login();
    }

    /**
     * Clear the subscription on destroy.
     */
    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.clearOperatorSubscription();
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

    public async guestLogin(): Promise<void> {
        this.router.navigate([`${this.currentMeetingId}/`]);
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
}
