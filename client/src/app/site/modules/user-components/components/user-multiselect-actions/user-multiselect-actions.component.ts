import {
    ChangeDetectionStrategy,
    Component,
    effect,
    inject,
    input,
    output,
    TemplateRef,
    viewChild
} from '@angular/core';
import { BaseComponent } from '@app/site/base/base.component';
import { ActiveMeetingIdService } from '@app/site/pages/meetings/services/active-meeting-id.service';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { OperatorService } from '@app/site/services/operator.service';
import { UserControllerService } from '@app/site/services/user-controller.service';
import { PromptService } from '@app/ui/modules/prompt-dialog';

@Component({
    selector: `os-user-multiselect-actions`,
    templateUrl: `./user-multiselect-actions.component.html`,
    styleUrls: [`./user-multiselect-actions.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class UserMultiselectActionsComponent extends BaseComponent {
    public repo = inject(UserControllerService);
    private operator = inject(OperatorService);
    private promptService = inject(PromptService);
    private activeMeetingIdService = inject(ActiveMeetingIdService);

    public implicitContent = viewChild.required(TemplateRef<any>);

    public canManage = input<boolean>(true);
    public canUpdate = input<boolean>(true);
    public selectedUsers = input<ViewUser[]>([]);

    public deleting = output<void>();
    public deselectAll = output<void>();
    public selectAll = output<void>();
    public selectedUsersChange = output<ViewUser[]>();

    public hasSelectedNonSamlUsers = false;

    private _selectedUsers: ViewUser[] = [];

    public constructor() {
        super();

        effect(() => {
            this.updateSelectedUsers();
        });
    }

    /**
     * Handler for bulk resetting passwords to the default ones. Needs multiSelect mode.
     */
    public async resetPasswordsToDefaultSelected(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to reset all passwords to the default ones?`);
        if (!(await this.promptService.open(title))) {
            return;
        }

        if (this.selectedUsers().find(row => row.user.id === this.operator.operatorId)) {
            this.raiseError(
                this.translate.instant(
                    `Note: Your own password was not changed. Please use the password change dialog instead.`
                )
            );
        }
        this.repo
            .resetPasswordToDefault(...this.selectedUsers().filter(row => row.user.id !== this.operator.operatorId))
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

        if (this.selectedUsers().find(row => row.user.id === this.operator.operatorId)) {
            this.raiseError(
                this.translate.instant(
                    `Note: Your own password was not changed. Please use the password change dialog instead.`
                )
            );
        }
        const rows = this.selectedUsers().filter(row => row.user.id !== this.operator.operatorId);
        this.repo.generateNewPasswords(rows);
    }

    public async sendInvitationEmailSelected(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to send emails to all selected participants?`);
        const content = this.selectedUsers().length + ` ` + this.translate.instant(`emails`);
        if (await this.promptService.open(title, content)) {
            this.repo
                .sendInvitationEmails(this.selectedUsers(), this.activeMeetingIdService.meetingId)
                .then(this.raiseError, this.raiseError);
        }
    }

    private updateSelectedUsers(): void {
        const users = this.selectedUsers();

        if (users.length !== this._selectedUsers.length) {
            this.calculateMetaData(users);
        }
        this._selectedUsers = users;
    }

    private calculateMetaData(users: ViewUser[]): void {
        this.hasSelectedNonSamlUsers = users.some(user => !user.saml_id);
    }

    /**
     * Bulk deletes users. Needs multiSelect mode to fill selectedRows
     */
    public deleteSelected(): void {
        this.deleting.emit();
    }
}
