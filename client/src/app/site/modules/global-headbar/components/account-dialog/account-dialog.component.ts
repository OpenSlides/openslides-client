import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { StorageService } from 'src/app/gateways/storage.service';
import { PasswordForm, PasswordFormComponent } from 'src/app/site/modules/user-components';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { PERSONAL_FORM_CONTROLS, ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { AuthService } from 'src/app/site/services/auth.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserService } from 'src/app/site/services/user.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { AccountService } from '../../../../services/account.service';

interface MenuItem {
    name: string;
}

enum MenuItems {
    CHANGE_PASSWORD = `Change password`,
    SHOW_PROFILE = `My profile`,
    SHOW_MEETINGS = `My meetings`,
    CLIENT_SETTINGS = `Settings`
}

@Component({
    selector: `os-account-dialog`,
    templateUrl: `./account-dialog.component.html`,
    styleUrls: [`./account-dialog.component.scss`]
})
export class AccountDialogComponent extends BaseUiComponent implements OnInit {
    @ViewChild(`changePasswordComponent`, { static: false })
    public changePasswordComponent!: PasswordFormComponent;

    private readonly menuItems: MenuItem[] = [
        {
            name: MenuItems.SHOW_PROFILE
        },
        {
            name: MenuItems.SHOW_MEETINGS
        },
        {
            name: MenuItems.CHANGE_PASSWORD
        },
        {
            name: MenuItems.CLIENT_SETTINGS
        }
    ];

    public get filteredMenuItems(): MenuItem[] {
        if (!this.operator.user?.saml_id) {
            return this.menuItems;
        }
        return this.menuItems.filter(item => item.name !== MenuItems.CHANGE_PASSWORD);
    }

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
            if (this._isUserInScope) {
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
    public clientSettingsForm!: UntypedFormGroup;

    private _self: ViewUser | null = null;
    private _isUserInScope = false;
    private _isEditing = false;

    public constructor(
        public dialogRef: MatDialogRef<AccountDialogComponent>,
        private operator: OperatorService,
        private repo: UserControllerService,
        private meetingRepo: MeetingControllerService,
        private userService: UserService,
        private snackbar: MatSnackBar,
        private authService: AuthService,
        private translate: TranslateService,
        private fb: UntypedFormBuilder,
        private store: StorageService,
        private accountService: AccountService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.repo.getViewModelObservable(this.operator.operatorId!).subscribe(user => (this._self = user)),
            this.operator.operatorUpdated.subscribe(() => this.updateIsUserInScope())
        );

        this.clientSettingsForm = this.fb.group({
            disablePauseAuConnections: [false]
        });

        this.store.get(`clientSettings`).then((val: any) => {
            if (val) {
                this.clientSettingsForm.patchValue(val);
                this.clientSettingsForm.markAsUntouched();
            }
        });
    }

    /**
     * clicking Shift and Enter will save automatically
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter` && event.shiftKey) {
            if (this.activeMenuItem === MenuItems.SHOW_PROFILE && this.isEditing && this.isUserFormValid) {
                this.saveUserChanges();
            } else if (this.activeMenuItem === MenuItems.CHANGE_PASSWORD && this.isUserPasswordValid) {
                this.changePassword();
            }
        }
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
        const meetingIds = this.self.ensuredMeetingIds;
        return meetingIds
            .map(id => this.meetingRepo.getViewModel(id) as ViewMeeting)
            .sort((meetingA, meetingB) => meetingA.name.localeCompare(meetingB?.name));
    }

    public getGroupsForMeeting(meeting: ViewMeeting): ViewGroup[] {
        return this.self!.groups(meeting.id);
    }

    public async changePassword(): Promise<void> {
        const { oldPassword, newPassword }: PasswordForm = this.userPasswordForm;

        try {
            await this.accountService.changePassword(oldPassword, newPassword);
            this.snackbar.open(this.translate.instant(`Password changed successfully!`), `Ok`);
        } catch (e) {
            if (e?.message) {
                this.snackbar.open(this.translate.instant(e.message), this.translate.instant(`OK`), {
                    duration: 0
                });
            }

            console.log(e);
        }
    }

    public async saveUserChanges(): Promise<void> {
        if (this.self) {
            const payload = this.userPersonalForm;
            if (payload.gender_id === 0) {
                payload.gender_id = null;
            }
            if (this.operator.hasPerms(Permission.userCanUpdate) && this._isUserInScope) {
                await this.repo.update(payload, this.self).resolve();
            } else {
                await this.repo.updateSelf(payload, this.self);
            }
        }
        this.isUserFormValid = false;
        this.isEditing = false;
    }

    public async saveClientSettings(): Promise<void> {
        this.store.set(`clientSettings`, this.clientSettingsForm.getRawValue());
        this.clientSettingsForm.markAsPristine();
    }

    private async updateIsUserInScope(): Promise<void> {
        if (this.operator.operatorId !== null) {
            this._isUserInScope = await this.userService.hasScopeManagePerms(this.operator.operatorId);
        }
    }
}
