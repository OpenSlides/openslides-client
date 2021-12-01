import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ChangePasswordComponent, PasswordForm } from 'app/shared/components/change-password/change-password.component';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewUser } from 'app/site/users/models/view-user';

import { MeetingRepositoryService } from '../../../core/repositories/management/meeting-repository.service';
import { PERSONAL_FORM_CONTROLS, UserService } from '../../../core/ui-services/user.service';

interface MenuItem {
    name: string;
}

enum MenuItems {
    CHANGE_PASSWORD = `Change password`,
    SHOW_PROFILE = `My profile`,
    SHOW_MEETINGS = `My meetings`
}

@Component({
    selector: `os-account-dialog`,
    templateUrl: `./account-dialog.component.html`,
    styleUrls: [`./account-dialog.component.scss`]
})
export class AccountDialogComponent extends BaseModelContextComponent implements OnInit {
    @ViewChild(`changePasswordComponent`, { static: false })
    public changePasswordComponent: ChangePasswordComponent;

    public readonly menuItems: MenuItem[] = [
        {
            name: MenuItems.SHOW_PROFILE
        },
        {
            name: MenuItems.SHOW_MEETINGS
        },
        {
            name: MenuItems.CHANGE_PASSWORD
        }
    ];

    public readonly menuItemsRef = MenuItems;

    public get self(): ViewUser | null {
        return this._self;
    }

    public activeMenuItem = this.menuItems[0].name;

    public get isAllowedFn(): (permission: string) => boolean {
        return permission => this.userService.isAllowed(permission, true);
    }

    public get shouldEnableFormControlFn(): (controlName: string) => boolean {
        return controlName => {
            const canManageUsers = this.userService.isAllowed(`manage`, true);
            if (canManageUsers && this._isUserInScope) {
                return true;
            } else {
                return PERSONAL_FORM_CONTROLS.includes(controlName);
            }
        };
    }

    public set isEditing(is: boolean) {
        this._isEditing = is;
        if (is) {
            this.updateIsUserInScope();
        }
    }

    public get isEditing(): boolean {
        return this._isEditing;
    }

    public isUserFormValid = false;
    public isUserPasswordValid = false;
    public userPersonalForm: any;
    public userPasswordForm: PasswordForm;

    private _self: ViewUser;
    private _isUserInScope: boolean;
    private _isEditing = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        translate: TranslateService,
        public dialogRef: MatDialogRef<AccountDialogComponent>,
        private operator: OperatorService,
        private userRepo: UserRepositoryService,
        private userService: UserService,
        private meetingRepo: MeetingRepositoryService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.subscriptions.push(
            this.userRepo.getViewModelObservable(this.operator.operatorId).subscribe(user => (this._self = user)),
            this.operator.operatorUpdatedEvent.subscribe(() => this.updateIsUserInScope())
        );
    }

    /**
     * Closes the account dialog programmatically
     */
    public closeDialog(): void {
        this.dialogRef.close();
    }

    public getAllMeetings(): ViewMeeting[] {
        if (!this.self) {
            return [];
        }
        const meetingIds = this.self.group_$_ids.map(groupId => parseInt(groupId, 10));
        return meetingIds
            .map(id => this.meetingRepo.getViewModel(id))
            .sort((meetingA, meetingB) => meetingA.name.localeCompare(meetingB.name));
    }

    public getGroupsForMeeting(meeting: ViewMeeting): ViewGroup[] {
        return this.self.groups(meeting.id);
    }

    public async changePassword(): Promise<void> {
        const { oldPassword, newPassword }: PasswordForm = this.userPasswordForm;
        await this.userRepo.setPasswordSelf(this.self, oldPassword, newPassword);
        this.changePasswordComponent.reset();
    }

    public async saveUserChanges(): Promise<void> {
        if (this.operator.hasPerms(Permission.userCanManage) && this._isUserInScope) {
            await this.userRepo.update(this.userPersonalForm, this.self);
        } else {
            await this.userRepo.updateSelf(this.userPersonalForm, this.self);
        }
        this.isUserFormValid = false;
        this.isEditing = false;
    }

    protected getModelRequest(): SimplifiedModelRequest | null {
        return {
            viewModelCtor: ViewUser,
            ids: [this.operator.operatorId],
            fieldset: `orgaEdit`,
            follow: [{ idField: `group_$_ids`, fieldset: `title`, follow: [{ idField: `meeting_id` }] }]
        };
    }

    private async updateIsUserInScope(): Promise<void> {
        this._isUserInScope = await this.userService.isUserInScope(this.operator.operatorId);
    }
}
