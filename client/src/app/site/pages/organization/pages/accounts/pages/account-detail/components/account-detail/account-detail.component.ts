import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { CML, getOmlVerboseName, OML, OMLMapping } from 'src/app/domain/definitions/organization-permission';
import { BaseComponent } from 'src/app/site/base/base.component';
import { UserDetailViewComponent } from 'src/app/site/modules/user-components';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewCommittee } from '../../../../../committees';
import { CommitteeControllerService } from '../../../../../committees/services/committee-controller.service';
import { AccountControllerService } from '../../../../services/common/account-controller.service';

@Component({
    selector: `os-account-detail`,
    templateUrl: `./account-detail.component.html`,
    styleUrls: [`./account-detail.component.scss`]
})
export class AccountDetailComponent extends BaseComponent implements OnInit {
    public get organizationManagementLevels(): string[] {
        return Object.values(OML).filter((level: OML) => this.operator.hasOrganizationPermissions(level));
    }

    @ViewChild(UserDetailViewComponent, { static: false })
    public set userDetailView(userDetailView: UserDetailViewComponent | undefined) {
        userDetailView?.markAsPristine();
    }

    public readonly additionalFormControls = {
        default_structure_level: [``],
        default_number: [``],
        default_vote_weight: [``],
        organization_management_level: [],
        committee_$_management_level: []
    };

    public isFormValid = false;
    public personalInfoFormValue: any = {};
    public formErrors: { [name: string]: boolean } | null = null;

    public isEditingUser = false;
    public user: ViewUser | null = null;
    public isNewUser = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        private osRouter: OpenSlidesRouterService,
        private operator: OperatorService,
        public readonly committeeController: CommitteeControllerService,
        private accountController: AccountControllerService,
        private userController: UserControllerService,
        private promptService: PromptService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.getUserByUrl();
    }

    public getTransformSetFn(): (value?: string[]) => Id[] {
        return () => (this.user ? this.user.committee_management_level_ids(CML.can_manage) : []);
    }

    public getTransformPropagateFn(): (value?: Id[]) => any {
        return value => ({ [CML.can_manage]: value });
    }

    public getSaveAction(): () => Promise<void> {
        return async () => {
            if (!this.isFormValid) {
                this.checkFormForErrors();
                return;
            }

            try {
                await this.createOrUpdateUser();
            } catch (e) {
                this.raiseError(e);
            }
        };
    }

    public onCancel(): void {
        this.router.navigate([`..`], { relativeTo: this.route });
        if (!this.isNewUser) {
            this.isEditingUser = false;
        }
    }
    /**
     * (Re)- send an invitation email for this user after confirmation
     */
    public async sendInvitationEmail(): Promise<void> {
        const title = this.translate.instant(`Sending an invitation email`);
        const content = this.translate.instant(`Are you sure you want to send an invitation email to the user?`);
        if (await this.promptService.open(title, content)) {
            this.userController.sendInvitationEmails([this.user!]).then(this.raiseError, this.raiseError);
        }
    }

    /**
     * Get information about the last time an invitation email was sent to a user
     *
     * @returns a string representation about the last time an email was sent to a user
     */
    public getEmailSentTime(): string {
        if (!this.user.isLastEmailSend) {
            return this.translate.instant(`No email sent`);
        }
        return this.userController.getLastEmailSentTimeString(this.user);
    }

    /**
     * Handler for the generate Password button.
     */
    public getRandomPasswordFn(): () => string {
        return () => this.userController.getRandomPassword();
    }

    public getOmlVerboseName(omlKey: string): string {
        return getOmlVerboseName(omlKey as keyof OMLMapping);
    }

    public editMember(): void {
        this.router.navigate([`edit`], { relativeTo: this.route });
    }

    /**
     * click on the delete user button
     */
    public async deleteUser(): Promise<void> {
        if (await this.accountController.doDeleteOrRemove([this.user!])) {
            this.router.navigate([`./accounts/`]);
        }
    }

    public getUserCommitteeManagementLevels(): ViewCommittee[] {
        const committeesToManage: (ViewCommittee | null)[] = this.user!.committee_management_level_ids(
            CML.can_manage
        ).map(committeeId => this.committeeController.getViewModel(committeeId));
        return committeesToManage.filter(committee => !!committee) as ViewCommittee[];
    }

    private getUserByUrl(): void {
        this.subscriptions.push(
            this.osRouter.currentParamMap.subscribe(params => {
                if (params[`id`]) {
                    this.loadUserById(+params[`id`]);
                } else {
                    super.setTitle(`New member`);
                    this.isNewUser = true;
                    this.isEditingUser = true;
                }
            }),
            this.route.url.subscribe(segments => {
                if (segments[0]?.path === `edit`) {
                    this.isEditingUser = true;
                }
            })
        );
    }

    private loadUserById(userId: number | null): void {
        if (userId) {
            this.subscriptions.push(
                this.userController.getViewModelObservable(userId).subscribe(user => {
                    if (user) {
                        const title = user.getTitle();
                        super.setTitle(title);
                        this.user = user;
                    }
                })
            );
        }
    }

    private async createOrUpdateUser(): Promise<void> {
        if (this.isNewUser) {
            await this.createUser();
        } else {
            await this.updateUser();
        }
    }

    private async createUser(): Promise<void> {
        const payload = this.getPartialUserPayload();
        const identifiable = (await this.userController.create(payload))[0];
        this.router.navigate([`..`, identifiable.id], { relativeTo: this.route });
    }

    private async updateUser(): Promise<void> {
        const payload = this.getPartialUserPayload();
        await this.userController.update(payload, this.user!).resolve();
        this.router.navigate([`..`], { relativeTo: this.route });
    }

    private getPartialUserPayload(): any {
        return this.personalInfoFormValue;
    }

    private checkFormForErrors(): void {
        let hint = ``;
        if (this.formErrors && Object.keys(this.formErrors).length) {
            hint = Object.keys(this.formErrors)
                .map(error => this.getErrorHint(error))
                .join(`\n`);
        }
        this.raiseError(hint);
    }

    private getErrorHint(error: string): string {
        let hint = ``;
        switch (error) {
            case `name`:
                hint = `At least one of username, first name or last name has to be set.`;
                break;
            case `management_level`:
                hint = `At least one committee or an organization management-level has to be set.`;
                break;
        }
        return this.translate.instant(hint);
    }
}
