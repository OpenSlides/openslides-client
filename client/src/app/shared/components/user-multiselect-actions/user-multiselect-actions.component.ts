import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OperatorService } from 'app/core/core-services/operator.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewUser } from 'app/site/users/models/view-user';

@Component({
    selector: `os-user-multiselect-actions`,
    templateUrl: `./user-multiselect-actions.component.html`,
    styleUrls: [`./user-multiselect-actions.component.scss`]
})
export class UserMultiselectActionsComponent extends BaseComponent implements OnInit {
    @Input()
    public selectedUsers: ViewUser[] = [];

    @Input()
    public canManage = true;

    @Output()
    public selectAll = new EventEmitter<void>();

    @Output()
    public deselectAll = new EventEmitter<void>();

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private operator: OperatorService,
        private promptService: PromptService,
        public repo: UserRepositoryService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {}

    /**
     * Handler for bulk resetting passwords to the default ones. Needs multiSelect mode.
     */
    public async resetPasswordsToDefaultSelected(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to reset all passwords to the default ones?`);
        if (!(await this.promptService.open(title))) {
            return;
        }

        if (this.selectedUsers.find(row => row.user.id === this.operator.operatorId)) {
            this.raiseError(
                this.translate.instant(
                    `Note: Your own password was not changed. Please use the password change dialog instead.`
                )
            );
        }
        this.repo.resetPasswordToDefault(...this.selectedUsers).catch(this.raiseError);
    }

    /**
     * Handler for bulk generating new passwords. Needs multiSelect mode.
     */
    public async generateNewPasswordsPasswordsSelected(): Promise<void> {
        const title = this.translate.instant(
            `Are you sure you want to generate new passwords for all selected participants?`
        );
        const content = this.translate.instant(
            `Note, that the default password will be changed to the new generated one.`
        );
        if (!(await this.promptService.open(title, content))) {
            return;
        }

        if (this.selectedUsers.find(row => row.user.id === this.operator.operatorId)) {
            this.raiseError(
                this.translate.instant(
                    `Note: Your own password was not changed. Please use the password change dialog instead.`
                )
            );
        }
        const rows = this.selectedUsers.filter(row => row.user.id !== this.operator.operatorId);
        this.repo.bulkGenerateNewPasswords(rows);
    }

    /**
     * Bulk deletes users. Needs multiSelect mode to fill selectedRows
     */
    public async deleteSelected(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete all selected participants?`);
        if (await this.promptService.open(title)) {
            this.repo.delete(...this.selectedUsers).catch(this.raiseError);
        }
    }
}
