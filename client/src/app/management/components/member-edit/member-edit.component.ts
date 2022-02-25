import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { OperatorService } from 'app/core/core-services/operator.service';
import { CML, getOmlVerboseName, OML, OMLMapping } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';

import { MemberService } from '../../../core/core-services/member.service';
import { UserDetailViewComponent } from '../../../shared/components/user-detail-view/user-detail-view.component';
import { ViewCommittee } from '../../models/view-committee';

@Component({
    selector: `os-member-edit`,
    templateUrl: `./member-edit.component.html`,
    styleUrls: [`./member-edit.component.scss`]
})
export class MemberEditComponent extends BaseModelContextComponent implements OnInit {
    public readonly OML = OML;

    public get organizationManagementLevels(): string[] {
        return Object.values(OML).filter(level => this.operator.hasOrganizationPermissions(level));
    }

    @ViewChild(UserDetailViewComponent, { static: false })
    public set userDetailView(userDetailView: UserDetailViewComponent) {
        userDetailView.markAsPristine();
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
    public user: ViewUser;
    public isNewUser = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        public committeeRepo: CommitteeRepositoryService,
        private router: Router,
        private route: ActivatedRoute,
        private repo: UserRepositoryService,
        private operator: OperatorService,
        private memberService: MemberService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        super.ngOnInit();
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
     * Handler for the generate Password button.
     */
    public getRandomPasswordFn(): () => string {
        return () => this.repo.getRandomPassword();
    }

    public getOmlVerboseName(omlKey: keyof OMLMapping): string {
        return getOmlVerboseName(omlKey);
    }

    public editMember(): void {
        this.router.navigate([`edit`], { relativeTo: this.route });
    }

    /**
     * click on the delete user button
     */
    public async deleteUser(): Promise<void> {
        if (await this.memberService.doDeleteOrRemove({ toDelete: [this.user], toRemove: [] })) {
            this.router.navigate([`./accounts/`]);
        }
    }

    public getUserCommitteeManagementLevels(): ViewCommittee[] {
        const committeesToManage: ViewCommittee[] = this.user
            .committee_management_level_ids(CML.can_manage)
            .map(committeeId => this.committeeRepo.getViewModel(committeeId));
        return committeesToManage.filter(committee => !!committee);
    }

    private getUserByUrl(): void {
        this.subscriptions.push(
            this.route.params.subscribe(params => {
                if (params.id) {
                    this.loadUserById(+params.id);
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

    private loadUserById(userId: number): void {
        if (userId) {
            this.subscribe({
                viewModelCtor: ViewUser,
                ids: [userId],
                follow: [`committee_ids`],
                fieldset: `orgaEdit`
            });

            this.subscriptions.push(
                this.repo.getViewModelObservable(userId).subscribe(user => {
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
        const identifiable = (await this.repo.create(payload))[0];
        this.router.navigate([`..`, identifiable.id], { relativeTo: this.route });
    }

    private async updateUser(): Promise<void> {
        const payload = this.getPartialUserPayload();
        await this.repo.update(payload, this.user).resolve();
        this.router.navigate([`..`], { relativeTo: this.route });
    }

    private getPartialUserPayload(): any {
        return this.personalInfoFormValue;
    }

    private checkFormForErrors(): void {
        let hint = ``;
        if (Object.keys(this.formErrors).length) {
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
