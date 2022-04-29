import { Component, OnInit, ViewChild } from '@angular/core';
import { PERSONAL_FORM_CONTROLS, ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { Permission } from 'src/app/domain/definitions/permission';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { MatDialogRef } from '@angular/material/dialog';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { PasswordFormComponent, PasswordForm } from 'src/app/ui/modules/user-components';
import { UserService } from 'src/app/site/services/user.service';

interface MenuItem {
    name: string;
}

enum MenuItems {
    CHANGE_PASSWORD = `Change password`,
    SHOW_PROFILE = `My profile`,
    SHOW_MEETINGS = `My meetings`
}

const PERSONAL_PERMISSIONS = [`seePersonal`, `seeName`, `changePersonal`];

@Component({
    selector: 'os-account-dialog',
    templateUrl: './account-dialog.component.html',
    styleUrls: ['./account-dialog.component.scss']
})
export class AccountDialogComponent extends BaseUiComponent implements OnInit {
    @ViewChild(`changePasswordComponent`, { static: false })
    public changePasswordComponent!: PasswordFormComponent;

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
    public userPasswordForm!: PasswordForm;

    private _self: ViewUser | null = null;
    private _isUserInScope: boolean = false;
    private _isEditing = false;

    public constructor(
        public dialogRef: MatDialogRef<AccountDialogComponent>,
        private operator: OperatorService,
        private repo: UserControllerService,
        private meetingRepo: MeetingControllerService,
        private userService: UserService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.repo.getViewModelObservable(this.operator.operatorId!).subscribe(user => (this._self = user)),
            this.operator.operatorUpdated.subscribe(() => this.updateIsUserInScope())
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
            .map(id => this.meetingRepo.getViewModel(id) as ViewMeeting)
            .sort((meetingA, meetingB) => meetingA.name.localeCompare(meetingB.name));
    }

    public getGroupsForMeeting(meeting: ViewMeeting): ViewGroup[] {
        return this.self!.groups(meeting.id);
    }

    public async changePassword(): Promise<void> {
        const { oldPassword, newPassword }: PasswordForm = this.userPasswordForm;
        await this.repo.setPasswordSelf(this.self!, oldPassword, newPassword);
        this.changePasswordComponent.reset();
    }

    public async saveUserChanges(): Promise<void> {
        if (this.self) {
            if (this.operator.hasPerms(Permission.userCanManage) && this._isUserInScope) {
                await this.repo.update(this.userPersonalForm, this.self).resolve();
            } else {
                await this.repo.updateSelf(this.userPersonalForm, this.self);
            }
        }
        this.isUserFormValid = false;
        this.isEditing = false;
    }

    private async updateIsUserInScope(): Promise<void> {
        this._isUserInScope = true;
        // this._isUserInScope = await this.repo.isUserInSameScope(this.operator.operatorId);
    }
}
