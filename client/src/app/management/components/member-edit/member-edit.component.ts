import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CommitteeRepositoryService } from 'app/core/repositories/event-management/committee-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { genders } from 'app/shared/models/users/user';
import { OneOfValidator } from 'app/shared/validators/one-of-validator';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';

@Component({
    selector: 'os-member-edit',
    templateUrl: './member-edit.component.html',
    styleUrls: ['./member-edit.component.scss']
})
export class MemberEditComponent extends BaseModelContextComponent implements OnInit {
    public personalInfoForm: FormGroup;

    public genders = genders;

    public isEditingUser = false;
    public user: ViewUser;
    public isNewUser = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public committeeRepo: CommitteeRepositoryService,
        private fb: FormBuilder,
        private repo: UserRepositoryService,
        private route: ActivatedRoute,
        private router: Router,
        private promptService: PromptService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.getUserByUrl();
    }

    public async onSubmit(): Promise<void> {
        if (this.personalInfoForm.invalid) {
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
    }

    /**
     * Should determine if the user (Operator) has the
     * correct permission to perform the given action.
     *
     * actions might be:
     * - delete         (deleting the user) (users.can_manage and not ownPage)
     * - seeName        (title, first, last, gender, about) (user.can_see_name or ownPage)
     * - seeOtherUsers  (title, first, last, gender, about) (user.can_see_name)
     * - seeExtra       (email, comment, is_active, last_email_send) (user.can_see_extra_data)
     * - seePersonal    (mail, username, structure level) (user.can_see_extra_data or ownPage)
     * - manage         (everything) (user.can_manage)
     * - changePersonal (mail, username, about) (user.can_manage or ownPage)
     * - changePassword (user.can_change_password)
     *
     * @param action the action the user tries to perform
     */
    public isAllowed(action: string): boolean {
        switch (action) {
            default:
                return true;
        }
    }

    /**
     * Handler for the generate Password button.
     */
    public setRandomPassword(): void {
        this.personalInfoForm.patchValue({
            default_password: this.repo.getRandomPassword()
        });
    }

    /**
     * clicking Shift and Enter will save automatically
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && event.shiftKey) {
            this.onSubmit();
        }
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

    /**
     * sets editUser variable and editable form
     * @param edit
     */
    public async setEditMode(edit: boolean): Promise<void> {
        this.isEditingUser = edit;

        if (edit) {
            this.enterEditMode();
        }

        // case: abort creation of a new user
        if (this.isNewUser && !edit) {
            this.router.navigate(['./members/']);
        }
    }

    private enterEditMode(): void {
        this.createForm();
        this.updateFormControlsAccessibility();
        if (this.user) {
            this.patchFormValues();
        }
    }

    /**
     * Updates the formcontrols of the `personalInfoForm` with the values from a given user.
     */
    private patchFormValues(): void {
        const personalInfoPatch = {};
        Object.keys(this.personalInfoForm.controls).forEach(ctrl => {
            if (typeof this.user[ctrl] === 'function') {
                personalInfoPatch[ctrl] = this.user[ctrl]();
            } else {
                personalInfoPatch[ctrl] = this.user[ctrl];
            }
        });
        this.personalInfoForm.patchValue(personalInfoPatch);
    }

    /**
     * Makes the form editable
     */
    private updateFormControlsAccessibility(): void {
        const formControlNames = Object.keys(this.personalInfoForm.controls);

        // Enable all controls.
        formControlNames.forEach(formControlName => {
            this.personalInfoForm.get(formControlName).enable();
        });

        // Disable not permitted controls
        if (!this.isAllowed('manage')) {
            formControlNames.forEach(formControlName => {
                if (!['username', 'email', 'about_me'].includes(formControlName)) {
                    this.personalInfoForm.get(formControlName).disable();
                }
            });
        }
    }

    /**
     * initialize the form with default values
     */
    private createForm(): void {
        if (this.personalInfoForm) {
            return;
        }
        this.personalInfoForm = this.fb.group({
            username: ['', Validators.required],
            title: [undefined],
            first_name: [undefined],
            last_name: [undefined],
            gender: [undefined],
            email: [undefined, Validators.email],
            committee_as_member_ids: [[]],
            last_email_send: [undefined],
            default_password: [undefined],
            default_structure_level: [undefined],
            default_number: [undefined],
            default_vote_weight: [undefined],
            is_active: [true],
            is_physical_person: [true]
        });
    }

    private getUserByUrl(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === 'create') {
            super.setTitle('New member');
            this.isNewUser = true;
            this.setEditMode(true);
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
                follow: [],
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
            await this.createRealUser();
        } else {
            await this.updateRealUser();
        }
    }

    private async createRealUser(): Promise<void> {
        const payload = {
            ...this.personalInfoForm.value
        };
        const identifiable = await this.repo.create(payload);
        this.router.navigate(['..', identifiable.id], { relativeTo: this.route });
    }

    private async updateRealUser(): Promise<void> {
        const payload = {
            ...this.personalInfoForm.value
        };
        await this.repo.update(payload, this.user);
        this.setEditMode(false);
    }

    private checkFormForErrors(): void {
        let hint = '';
        const personalInfoForm = this.personalInfoForm;
        if (personalInfoForm.errors) {
            hint = 'At least one of username, first name or last name has to be set.';
        } else {
            for (const formControl in personalInfoForm.controls) {
                if (personalInfoForm.get(formControl).errors) {
                    hint = formControl + ' is incorrect.';
                }
            }
        }
        this.raiseError(this.translate.instant(hint));
    }
}
