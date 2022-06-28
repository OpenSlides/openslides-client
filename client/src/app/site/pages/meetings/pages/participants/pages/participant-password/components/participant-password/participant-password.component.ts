import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { PasswordForm } from 'src/app/site/modules/user-components';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';

@Component({
    selector: `os-participant-password`,
    templateUrl: `./participant-password.component.html`,
    styleUrls: [`./participant-password.component.scss`]
})
export class ParticipantPasswordComponent extends BaseMeetingComponent implements OnInit {
    public isValid = false;
    public passwordForm: PasswordForm | string = ``;

    /**
     * the user that is currently worked own
     */
    public user!: ViewUser;

    /**
     * if this pw-page is for your own user
     */
    public ownPage: boolean = false;

    /**
     * if current user has the "can_manage" permission
     */
    public canManage: boolean = false;

    public get generatePasswordFn(): () => string {
        return () => this.repo.getRandomPassword();
    }

    private urlUserId: number | null = null;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private operator: OperatorService,
        private openslidesRouter: OpenSlidesRouterService,
        private route: ActivatedRoute,
        private repo: ParticipantControllerService
    ) {
        super(componentServiceCollector, translate);
    }

    /**
     * Initializes the forms and some of the frontend options
     */
    public ngOnInit(): void {
        super.setTitle(this.translate.instant(`Change password`));
        this.openslidesRouter.currentParamMap.subscribe(params => {
            if (params[`id`]) {
                this.urlUserId = +params[`id`];
                this.repo.getViewModelObservable(this.urlUserId).subscribe(user => {
                    if (user) {
                        this.user = user;
                        this.updateUser();
                    }
                });
            }
            this.updateUser();
        });

        this.operator.operatorUpdated.subscribe(() => {
            this.updateUser();
        });
    }

    private updateUser(): void {
        this.ownPage = this.urlUserId ? this.operator.operatorId === this.urlUserId : true;
        this.canManage = this.operator.hasPerms(Permission.userCanManage);
    }

    /**
     * Triggered by the "x" Button of the Form
     */
    public goBack(): void {
        this.router.navigate([this.activeMeetingId, `participants`, this.user.id]);
    }

    /**
     * Handles the whole save routine for every possible event
     */
    public async save(): Promise<void> {
        if (!this.isValid) {
            return;
        }
        // can Manage, but not own Page (a.k.a. Admin)
        try {
            if (this.canManage && !this.ownPage) {
                const password = this.passwordForm as string;
                await this.repo.setPassword(this.user, password);
            } else if (this.ownPage) {
                const { oldPassword, newPassword }: PasswordForm = this.passwordForm as PasswordForm;
                await this.repo.setPasswordSelf(this.user, newPassword, oldPassword);
            }
            this.goBack();
        } catch (e) {
            this.raiseError(e);
        }
    }
}
