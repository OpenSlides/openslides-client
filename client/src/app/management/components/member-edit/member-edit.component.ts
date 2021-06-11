import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { OperatorService } from 'app/core/core-services/operator.service';
import { OML } from 'app/core/core-services/organization-permission';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { OneOfValidator } from 'app/shared/validators/one-of-validator';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';

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

    public get randomPasswordFn(): () => string {
        return () => this.getRandomPassword();
    }

    public readonly additionalFormControls = {
        committee_ids: [[]],
        default_structure_level: [''],
        default_number: [''],
        default_vote_weight: [''],
        organization_management_level: []
    };

    public readonly additionalValidators = OneOfValidator.validation(
        ['committee_ids', 'organization_management_level'],
        'management_level'
    );

    public isFormValid = false;
    public personalInfoFormValue = {};
    public formErrors: { [name: string]: boolean } | null = null;

    public isEditingUser = false;
    public user: ViewUser;
    public isNewUser = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public committeeRepo: CommitteeRepositoryService,
        private repo: UserRepositoryService,
        private route: ActivatedRoute,
        private router: Router,
        private promptService: PromptService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.getUserByUrl();
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
        if (this.isNewUser) {
            this.router.navigate(['..'], { relativeTo: this.route });
        } else {
            this.isEditingUser = false;
        }
    }

    /**
     * Handler for the generate Password button.
     */
    public getRandomPassword(): string {
        return this.repo.getRandomPassword();
    }

    /**
     * click on the delete user button
     */
    public async deleteUserButton(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this member?');
        const content = this.user.full_name;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.user);
            this.router.navigate(['./members/']);
        }
    }

    private getUserByUrl(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === 'create') {
            super.setTitle('New member');
            this.isNewUser = true;
            this.isEditingUser = true;
        } else {
            this.route.params.subscribe(params => {
                this.loadUserById(Number(params.id));
            });
        }
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
        const payload = {
            ...this.personalInfoFormValue
        };
        const identifiable = await this.repo.create(payload);
        this.router.navigate(['..', identifiable.id], { relativeTo: this.route });
    }

    private async updateUser(): Promise<void> {
        const payload = {
            ...this.personalInfoFormValue
        };
        await this.repo.update(payload, this.user);
        this.isEditingUser = false;
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
