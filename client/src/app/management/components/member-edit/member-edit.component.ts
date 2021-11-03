import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { OperatorService } from 'app/core/core-services/operator.service';
import { CML, getOmlVerboseName, OML, OMLMapping } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { ViewCommittee } from '../../models/view-committee';
import { MemberService } from '../../../core/core-services/member.service';

@Component({
    selector: 'os-member-edit',
    templateUrl: './member-edit.component.html',
    styleUrls: ['./member-edit.component.scss']
})
export class MemberEditComponent extends BaseModelContextComponent implements OnInit {
    public readonly OML = OML;

    public get organizationManagementLevels(): string[] {
        return Object.values(OML).filter(level => this.operator.hasOrganizationPermissions(level));
    }

    public readonly additionalFormControls = {
        committee_ids: [[]],
        default_structure_level: [''],
        default_number: [''],
        default_vote_weight: [''],
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
        public committeeRepo: CommitteeRepositoryService,
        private router: Router,
        private route: ActivatedRoute,
        private repo: UserRepositoryService,
        private operator: OperatorService,
        private memberService: MemberService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.getUserByUrl();
    }

    public transformPropagateFn(value?: Id[]): any {
        return (value || []).mapToObject(id => ({ [id]: CML.can_manage }));
    }

    public getTransformSetFn(): (value?: string[]) => any {
        return (value?: string[]) => {
            const managementIds = [];
            for (const strId of value || []) {
                if (this.user.committee_management_level(parseInt(strId, 10)) === CML.can_manage) {
                    managementIds.push(parseInt(strId, 10));
                }
            }
            return managementIds;
        };
    }

    public async onSubmit(): Promise<void> {
        if (!this.isFormValid) {
            this.checkFormForErrors();
            return;
        }

        try {
            await this.createOrUpdateUser();
        } catch (e) {
            this.raiseError(e);
        }
    }

    public onCancel(): void {
        this.router.navigate(['..'], { relativeTo: this.route });
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
        this.router.navigate(['edit'], { relativeTo: this.route });
    }

    /**
     * click on the delete user button
     */
    public async deleteUser(): Promise<void> {
        if (await this.memberService.delete([this.user])) {
            this.router.navigate(['./accounts/']);
        }
    }

    public getUserCommitteeManagementLevels(): string {
        const committeesToManage: ViewCommittee[] = [];
        for (const id of this.user.committee_$_management_level) {
            if (this.user.committee_management_level(id) === CML.can_manage) {
                committeesToManage.push(this.committeeRepo.getViewModel(id));
            }
        }
        return committeesToManage
            .filter(committee => !!committee)
            .map(committee => committee.getTitle())
            .join(', ');
    }

    private getUserByUrl(): void {
        this.subscriptions.push(
            this.route.params.subscribe(params => {
                if (params.id) {
                    this.loadUserById(+params.id);
                } else {
                    super.setTitle('New member');
                    this.isNewUser = true;
                    this.isEditingUser = true;
                }
            }),
            this.route.url.subscribe(segments => {
                if (segments[0]?.path === 'edit') {
                    this.isEditingUser = true;
                }
            })
        );
    }

    private loadUserById(userId: number): void {
        if (userId) {
            this.requestModels({
                viewModelCtor: ViewUser,
                ids: [userId],
                follow: ['committee_ids'],
                fieldset: 'orgaEdit'
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
        this.router.navigate(['..', identifiable.id], { relativeTo: this.route });
    }

    private async updateUser(): Promise<void> {
        const payload = this.getPartialUserPayload();
        await this.repo.update(payload, this.user);
        this.router.navigate(['..'], { relativeTo: this.route });
    }

    private getPartialUserPayload(): any {
        const payload = {
            ...this.personalInfoFormValue,
            committee_$_management_level: this.getCommitteeManagementLevelPayload(),
            committee_ids: this.getCommitteeMembershipAsIds()
        };
        return payload;
    }

    /**
     * Function to compare old CML of this user with new selected. Necessary to get removed management permissions and
     * parse them as `[committeeId]: null`.
     *
     * @returns An object with adjusted CML.
     */
    private getCommitteeManagementLevelPayload(): { [committeeId: number]: CML | null } {
        const committeeManagementIds = Object.keys(this.personalInfoFormValue.committee_$_management_level || {});
        const oldCommitteeManagementIds = (this.user?.committee_$_management_level || []) as any[];
        return {
            ...this.personalInfoFormValue.committee_$_management_level,
            ...oldCommitteeManagementIds.difference(committeeManagementIds).mapToObject(id => ({ [id]: null }))
        };
    }

    /**
     * Function to get assigned CML to committees, which this user is not related to. Users can get permissions only
     * for a committee, they are related to.
     *
     * @returns An array with ids for the committees this user is related to.
     */
    private getCommitteeMembershipAsIds(): Id[] {
        const committeeMembership = (this.personalInfoFormValue.committee_ids || []) as Id[];
        const committeeManager = Object.keys(this.personalInfoFormValue.committee_$_management_level || {}).map(strId =>
            parseInt(strId, 10)
        ) as Id[];
        return committeeMembership.concat(committeeManager.difference(committeeMembership));
    }

    private checkFormForErrors(): void {
        let hint = '';
        if (Object.keys(this.formErrors).length) {
            hint = Object.keys(this.formErrors)
                .map(error => this.getErrorHint(error))
                .join('\n');
        }
        this.raiseError(hint);
    }

    private getErrorHint(error: string): string {
        let hint = '';
        switch (error) {
            case 'name':
                hint = 'At least one of username, first name or last name has to be set.';
                break;
            case 'management_level':
                hint = 'At least one committee or an organization management-level has to be set.';
                break;
        }
        return this.translate.instant(hint);
    }
}
