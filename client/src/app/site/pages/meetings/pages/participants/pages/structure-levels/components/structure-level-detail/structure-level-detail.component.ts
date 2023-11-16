import { Component, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { StructureLevelControllerService } from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/services/structure-level-controller.service';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewStructureLevel } from '../../view-models';

/**
 * Detail component to display one motion block
 */
@Component({
    selector: `os-structure-level-detail`,
    templateUrl: `./structure-level-detail.component.html`,
    styleUrls: [`./structure-level-detail.component.scss`]
})
export class StructureLevelDetailComponent extends BaseMeetingComponent {
    public readonly COLLECTION = ViewStructureLevel.COLLECTION;

    /**
     * The form to edit the selected structure-level
     */
    public editForm!: UntypedFormGroup;

    /**
     * Reference to the template for edit-dialog
     */
    @ViewChild(`editDialog`, { static: true })
    private readonly _editDialog: TemplateRef<string> | null = null;

    /**
     * The one selected structure-level
     */
    public get selectedStructureLevel(): ViewStructureLevel {
        return this._selectedStructureLevel;
    }

    public set selectedStructureLevel(structureLevel: ViewStructureLevel) {
        this._selectedStructureLevel = structureLevel;
    }

    private _selectedStructureLevel!: ViewStructureLevel;

    /**
     * All categories with the selected one and all children.
     */
    public structureLevels: ViewStructureLevel[] = [];

    /**
     * Datasources for `structureLevels`. Holds all motions for one structure-level.
     */
    public readonly dataSources: { [id: number]: MatTableDataSource<ViewStructureLevel> } = {};

    /**
     * helper for permission checks
     *
     * @returns true if the user may alter motions
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.userCanManage);
    }

    private _dialogRef!: MatDialogRef<any>;
    private _structureLevelId: Id = -1;

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        private operator: OperatorService,
        private repo: StructureLevelControllerService,
        private promptService: PromptService,
        private formBuilder: UntypedFormBuilder,
        private dialog: MatDialog
    ) {
        super(componentServiceCollector, translate);
    }

    public onIdFound(id: Id | null): void {
        if (id) {
            this._structureLevelId = id;
            this.loadStructureLevelById();
        }
    }

    private loadStructureLevelById(): void {
        this.subscriptions.push(
            this.repo.getViewModelListObservable().subscribe(structureLevels => {
                const selectedStructureLevel = structureLevels.find(
                    structureLevel => structureLevel.id === this._structureLevelId
                );

                if (!selectedStructureLevel) {
                    return;
                }

                // Find index of last child. This can be easily done by searching, because this
                // is the flat sorted tree
                this.selectedStructureLevel = selectedStructureLevel;
                super.setTitle(this.selectedStructureLevel.name);
            })
        );
    }

    /**
     * Returns the columns that should be shown in the table
     *
     * @returns an array of strings building the column definition
     */
    public getColumnDefinition(): string[] {
        return [`title`, `state`, `recommendation`, `anchor`];
    }

    /**
     * Click handler to delete a structure-level
     */
    public async onDeleteButton(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this structure level?`);
        const content = this.selectedStructureLevel.name;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(this.selectedStructureLevel.id);
            this.router.navigate([`../`], { relativeTo: this.route });
        }
    }

    /**
     * Clicking escape while in editForm should deactivate edit mode.
     *
     * @param event The key that was pressed
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Escape`) {
            this._dialogRef.close();
        }
        if (event.key === `Enter`) {
            this.save();
        }
    }

    /**
     * Save event handler
     */
    public save(): void {
        this.repo
            .update(this.editForm!.value, this.selectedStructureLevel.id)
            .then(() => {
                this._dialogRef.close();
            })
            .catch(this.raiseError);
    }

    /**
     * Click handler for the edit button
     */
    public toggleEditMode(): void {
        this.editForm = this.formBuilder.group({
            name: [this.selectedStructureLevel.name, Validators.required],
            color: [this.selectedStructureLevel.color],
            allow_additional_time: [this.selectedStructureLevel.allow_additional_time]
        });

        this._dialogRef = this.dialog.open(this._editDialog!, infoDialogSettings);
    }
}
