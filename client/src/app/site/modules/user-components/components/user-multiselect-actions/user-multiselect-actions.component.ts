import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

@Component({
    selector: `os-user-multiselect-actions`,
    templateUrl: `./user-multiselect-actions.component.html`,
    styleUrls: [`./user-multiselect-actions.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMultiselectActionsComponent extends BaseUiComponent {
    @ViewChild(TemplateRef, { static: true })
    public implicitContent: TemplateRef<any>;

    @Input()
    public canManage = true;

    @Input()
    public selectedUsers: ViewUser[] = [];

    @Output()
    public deleting = new EventEmitter<void>();

    @Output()
    public deselectAll = new EventEmitter<void>();

    @Output()
    public selectAll = new EventEmitter<void>();

    @Output()
    public selectedUsersChange = new EventEmitter<ViewUser[]>();

    public constructor(
        private translate: TranslateService,
        private operator: OperatorService,
        private promptService: PromptService,
        private matSnackbar: MatSnackBar,
        private activeMeetingIdService: ActiveMeetingIdService,
        public repo: UserControllerService
    ) {
        super();
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
        this.repo
            .resetPasswordToDefault(...this.selectedUsers.filter(row => row.user.id !== this.operator.operatorId))
            .catch(this.raiseError);
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
        this.repo.generateNewPasswords(rows);
    }

    public async sendInvitationEmailSelected(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to send emails to all selected participants?`);
        const content = this.selectedUsers.length + ` ` + this.translate.instant(`emails`);
        if (await this.promptService.open(title, content)) {
            this.repo
                .sendInvitationEmails(this.selectedUsers, this.activeMeetingIdService.meetingId)
                .then(this.raiseError, this.raiseError);
        }
    }

    /**
     * Bulk deletes users. Needs multiSelect mode to fill selectedRows
     */
    public deleteSelected(): void {
        this.deleting.emit();
    }

    protected override raiseError = (message: string): void => {
        this.matSnackbar.open(message, this.translate.instant(`OK`));
    };
}
