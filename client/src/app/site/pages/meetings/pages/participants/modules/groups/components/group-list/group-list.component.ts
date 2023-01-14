import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { AppPermission, DisplayPermission, PERMISSIONS } from 'src/app/domain/definitions/permission.config';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { GroupControllerService } from '../../services';

@Component({
    selector: `os-group-list`,
    templateUrl: `./group-list.component.html`,
    styleUrls: [`./group-list.component.scss`]
})
export class GroupListComponent extends BaseMeetingComponent implements OnInit {
    /**
     * Holds all Groups
     */
    public groups: ViewGroup[] = [];

    /**
     * The header rows that the table should show
     */
    public headerRowDef: string[] = [];

    /**
     * Show or hide the new groups box
     */
    public newGroup = false;

    /**
     * Show or hide edit Group features
     */
    public editGroup = false;

    /**
     * Store the group to edit
     */
    public selectedGroup: ViewGroup | null = null;

    @ViewChild(`groupForm`, { static: true })
    public groupForm: UntypedFormGroup | null = null;

    /**
     * Reference to the template
     */
    @ViewChild(`groupEditDialog`, { static: true })
    public groupEditDialog: TemplateRef<string> | null = null;

    private dialogRef: MatDialogRef<any> | null = null;

    public get permissionsPerApp(): AppPermission[] {
        return PERMISSIONS;
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private dialog: MatDialog,
        private repo: GroupControllerService,
        private promptService: PromptService,
        private formBuilder: UntypedFormBuilder
    ) {
        super(componentServiceCollector, translate);
    }

    /**
     * Init function.
     *
     * Monitor the repository for changes and update the local groups array
     */
    public ngOnInit(): void {
        super.setTitle(`Groups`);

        this.repo.getViewModelListObservable().subscribe(newViewGroups => {
            if (newViewGroups) {
                this.groups = newViewGroups.slice().sort((groupA, groupB) => groupA.weight - groupB.weight);
                this.updateRowDef();
            }
        });
    }

    /**
     * Set, if the view is in edit mode. If editMod eis false, the editing is canceled.
     * @param editMode
     * @param newGroup Set to true, if the edit mode is for creating instead of updating a group.
     */
    public setEditMode(editMode: boolean, newGroup: boolean = true): void {
        this.editGroup = editMode;
        this.newGroup = newGroup;

        const name = this.selectedGroup ? this.selectedGroup.name : ``;

        this.groupForm = this.formBuilder.group({
            name: [name, Validators.required]
        });

        this.dialogRef = this.dialog.open(this.groupEditDialog!, infoDialogSettings);

        this.dialogRef.keydownEvents().subscribe((event: KeyboardEvent) => {
            if (event.key === `Enter` && event.shiftKey && this.groupForm?.valid) {
                this.saveGroup(this.groupForm?.value);
            }
        });
    }

    /**
     * Creates or updates a group.
     */
    public async saveGroup(value: { name: string }): Promise<void> {
        if (!this.editGroup) {
            return;
        }

        if (this.newGroup) {
            await this.repo.create(value);
        } else {
            await this.repo.update(value, this.selectedGroup!);
        }
        this.cancelEditing();
    }

    /**
     * Select group in head bar
     */
    public selectGroup(group: ViewGroup): void {
        this.selectedGroup = group;
        this.setEditMode(true, false);
    }

    /**
     * Deletes the selected Group
     */
    public async deleteSelectedGroup(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this group?`);
        const content = this.translate.instant(this.selectedGroup!.name);
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.selectedGroup!);
            this.cancelEditing();
        }
    }

    /**
     * Cancel the editing
     */
    public cancelEditing(): void {
        this.dialogRef?.close();
        this.newGroup = false;
        this.editGroup = false;
        this.selectedGroup = null;
    }

    /**
     * Triggers when a permission was toggled
     * @param viewGroup
     * @param perm
     */
    public togglePermission(viewGroup: ViewGroup, perm: Permission): void {
        this.repo.togglePermission(viewGroup, perm);
    }

    /**
     * Update the rowDefinition after Reloading or changes
     */
    public updateRowDef(): void {
        // reset the rowDef list first
        this.headerRowDef = [`perm`];
        this.groups.forEach(viewGroup => {
            this.headerRowDef.push(`` + viewGroup.name);
        });
    }

    /**
     * Required to detect changes in *ngFor loops
     *
     * @param group Corresponding group that was changed
     */
    public trackGroupArray(group: ViewGroup): number {
        return group.id;
    }

    /**
     * Converts a permission string into MatTableDataSource
     * @param permissions
     */
    public getTableDataSource(permissions: DisplayPermission[]): MatTableDataSource<DisplayPermission> {
        return new MatTableDataSource(permissions);
    }

    /**
     * Determine if a group is protected from deletion
     * @param group ViewGroup
     */
    public isProtected(group: ViewGroup): boolean {
        return group.isAdminGroup || group.isDefaultGroup;
    }

    /**
     * Clicking escape while in #newGroupForm should toggle newGroup.
     */
    public keyDownFunction(event: KeyboardEvent): void {
        if (event.key === `Escape`) {
            this.newGroup = false;
        }
    }

    public hasGroupPerm(group: ViewGroup, perm: DisplayPermission): boolean {
        return group.hasPermission(perm.value);
    }
}
