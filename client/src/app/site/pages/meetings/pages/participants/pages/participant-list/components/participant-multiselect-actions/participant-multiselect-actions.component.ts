import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

@Component({
    selector: `os-participant-multiselect-actions`,
    templateUrl: `./participant-multiselect-actions.component.html`,
    styleUrls: [`./participant-multiselect-actions.component.scss`]
})
export class ParticipantMultiselectActionsComponent extends BaseComponent {
    @Input()
    public selectedUsers: ViewUser[] = [];

    @Input()
    public canManage = true;

    @Output()
    public selectAll = new EventEmitter<void>();

    @Output()
    public deselectAll = new EventEmitter<void>();

    public constructor(
        private operator: OperatorService,
        private promptService: PromptService,
        public repo: ParticipantControllerService,
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService
    ) {
        super(componentServiceCollector, translate);
    }

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
        this.repo.bulkGenerateNewPasswords(...rows);
    }

    /**
     * Bulk deletes users. Needs multiSelect mode to fill selectedRows
     */
    public async deleteSelected(): Promise<void> {
        await this.repo.removeUsersFromMeeting(this.selectedUsers);
    }
}
