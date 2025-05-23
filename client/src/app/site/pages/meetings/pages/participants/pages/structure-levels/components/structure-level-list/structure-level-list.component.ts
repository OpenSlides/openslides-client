import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { ViewStructureLevel } from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { StructureLevelControllerService } from '../../services/structure-level-controller.service';
import { StructureLevelSortService } from '../../services/structure-level-sort.service';

@Component({
    selector: `os-structure-level-list`,
    templateUrl: `./structure-level-list.component.html`,
    styleUrls: [`./structure-level-list.component.scss`],
    standalone: false
})
export class StructureLevelListComponent extends BaseMeetingListViewComponent<ViewStructureLevel> {
    @ViewChild(`structureLevelDialog`, { static: true })
    private structureLevelDialog: TemplateRef<string> | null = null;

    private dialogRef: MatDialogRef<any> | null = null;

    /**
     * Holds the create form
     */
    public structureLevelForm: UntypedFormGroup;

    /**
     * helper for permission checks
     *
     * @returns true if the user may alter structure levels
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.userCanManage);
    }

    /**
     * Holds the structureLevel that is currently be edit or null
     */
    public currentStructureLevel: ViewStructureLevel | null = null;

    public constructor(
        protected override translate: TranslateService,
        public repo: StructureLevelControllerService,
        private formBuilder: UntypedFormBuilder,
        private dialog: MatDialog,
        private promptService: PromptService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService,
        public sortService: StructureLevelSortService
    ) {
        super();
        super.setTitle(`Structure levels`);
        this.structureLevelForm = this.formBuilder.group({
            name: [``, Validators.required],
            color_check: false,
            color: [``, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]
        });
    }

    /**
     * Click handler for the plus button
     */
    public openStructureLevelDialog(structureLevel: ViewStructureLevel | null = null): void {
        this.currentStructureLevel = structureLevel;
        this.reset();
        this.structureLevelForm.get(`name`)!.setValue(structureLevel ? structureLevel.name : ``);
        if (structureLevel && !!structureLevel.color) {
            this.structureLevelForm.get(`color_check`).setValue(true);
        } else {
            this.structureLevelForm.get(`color`).disable();
        }
        this.structureLevelForm
            .get(`color`)!
            .setValue(structureLevel && !!structureLevel.color ? structureLevel.color : `#000000`);
        this.dialogRef = this.dialog.open(this.structureLevelDialog!, infoDialogSettings);
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.save();
            }
        });
    }

    /**
     * Deletes the given StructureLevel after a successful confirmation.
     */
    public async onDeleteButton(tag: ViewStructureLevel): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this structure level?`);
        const content = tag.name;
        if (await this.promptService.open(title, content)) {
            this.deleteStructureLevel(tag);
        }
    }

    /**
     * clicking Enter will save automatically
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter`) {
            this.save();
            this.dialogRef!.close();
        }
    }

    /**
     * if color_check is not set, disable color.
     * if color_check is set, enable color.
     */

    public onColorCheckChanged(): void {
        if (this.structureLevelForm.get(`color_check`).value) {
            this.structureLevelForm.get(`color`).enable();
        } else {
            this.structureLevelForm.get(`color`).disable();
        }
    }

    /**
     * Submit the form and create or update a structure level.
     */
    private save(): void {
        if (!this.structureLevelForm.value || !this.structureLevelForm.valid) {
            return;
        }
        if (this.currentStructureLevel) {
            this.updateStructureLevel();
        } else {
            this.createStructureLevel();
        }
        this.reset();
    }

    private updateStructureLevel(): void {
        if (this.currentStructureLevel) {
            const data = this.structureLevelForm.value;
            if (!data.color) {
                data.color = null;
            }
            this.repo.update(data, this.currentStructureLevel.id).catch(this.raiseError);
        }
    }

    private createStructureLevel(): void {
        this.repo.create(this.structureLevelForm.value).catch(this.raiseError);
    }

    private deleteStructureLevel(structureLevel: ViewStructureLevel): void {
        this.repo
            .delete(structureLevel.id)
            .then(() => this.cd.detectChanges())
            .catch(this.raiseError);
    }

    private reset(): void {
        this.structureLevelForm.reset();
    }
}
