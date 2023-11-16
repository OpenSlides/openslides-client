import { Component, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { ViewStructureLevel } from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { StructureLevelControllerService } from '../../services/structure-level-controller.service';

@Component({
    selector: `os-structure-level-list`,
    templateUrl: `./structure-level-list.component.html`,
    styleUrls: [`./structure-level-list.component.scss`]
})
export class StructureLevelListComponent extends BaseMeetingListViewComponent<ViewStructureLevel> {
    @ViewChild(`newStructureLevelDialog`, { static: true })
    private newStructureLevelDialog: TemplateRef<string> | null = null;

    private dialogRef: MatDialogRef<any> | null = null;

    /**
     * Holds the create form
     */
    public createForm: UntypedFormGroup;

    /**
     * helper for permission checks
     *
     * @returns true if the user may alter structure levels
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.userCanManage);
    }

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        protected override translate: TranslateService,
        public repo: StructureLevelControllerService,
        private formBuilder: UntypedFormBuilder,
        private dialog: MatDialog,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Structure Levels`);
        this.createForm = this.formBuilder.group({
            name: [``, Validators.required],
            color: [``, Validators.pattern(/^#[0-9a-fA-F]{6}$/)],
            allow_additional_time: [``]
        });
    }

    /**
     * Click handler for the plus button
     */
    public onPlusButton(): void {
        this.createForm.reset();
        this.dialogRef = this.dialog.open(this.newStructureLevelDialog!, infoDialogSettings);
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.save();
            }
        });
    }

    /**
     * clicking Enter will save automatically
     * clicking Escape will cancel the process
     *
     * @param event has the code
     */
    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === `Enter`) {
            this.save();
            this.dialogRef!.close();
        }
        if (event.key === `Escape`) {
            this.dialogRef!.close();
        }
    }

    /**
     * Sends the structure level to create to the repository.
     */
    private save(): void {
        if (this.createForm.valid) {
            this.repo.create(this.createForm.value);
        }
    }
}
