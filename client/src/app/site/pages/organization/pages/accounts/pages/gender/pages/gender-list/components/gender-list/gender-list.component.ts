import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { GenderControllerService } from '../../../../services/gender-controller.service';
import { ViewGender } from '../../../../view-models/view-gender';

@Component({
    selector: `os-gender-list`,
    templateUrl: `./gender-list.component.html`,
    styleUrl: `./gender-list.component.scss`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GenderListComponent extends BaseListViewComponent<ViewGender> {
    @ViewChild(`genderDialog`, { static: true })
    private genderDialog: TemplateRef<string> | null = null;

    private dialogRef: MatDialogRef<any> | null = null;

    /**
     * Holds the create form
     */
    public genderForm: UntypedFormGroup;

    /**
     * Check in multiselect if a default gender is selected
     */
    public get hasDefaultGenderSelected(): boolean {
        return this.selectedRows.filter(view => view.isPredefined).length > 0;
    }

    private currentGender: ViewGender;

    public constructor(
        protected override translate: TranslateService,
        public repo: GenderControllerService,
        private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder,
        private cd: ChangeDetectorRef,
        private promptService: PromptService
    ) {
        super();
        this.setTitle(`Genders`);
        this.canMultiSelect = true;
        this.genderForm = this.formBuilder.group({
            name: [``, Validators.required]
        });
    }

    public openGenderDialog(gender?: ViewGender): void {
        this.currentGender = gender;
        this.genderForm.reset();
        this.genderForm.get(`name`)!.setValue(gender ? gender.name : ``);
        this.dialogRef = this.dialog.open(this.genderDialog!, infoDialogSettings);
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.save();
            }
        });
    }

    public async deleteGenders(...genders: ViewGender[]): Promise<void | void[]> {
        const title =
            genders.length === 1
                ? this.translate.instant(`Are you sure you want to delete this gender?`)
                : this.translate.instant(`Are you sure you want to delete all selected genders?`);
        const content = genders.length === 1 ? genders[0].name : ``;
        if (await this.promptService.open(title, content)) {
            const deleteGenderIds = genders.filter(g => !g.isPredefined).map(g => g.id);
            if (deleteGenderIds) {
                return this.repo.delete(...deleteGenderIds).then(() => this.cd.detectChanges());
            }
        }
    }

    public deleteSelectedGenders(): void {
        this.deleteGenders(...this.selectedRows);
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

    private updateGenderHelper(): void {
        if (this.currentGender) {
            const data = this.genderForm.value;
            this.repo.update(data, this.currentGender.id);
        }
    }

    private createGenderHelper(): void {
        this.repo.create(this.genderForm.value);
    }

    private save(): void {
        if (!this.genderForm.value || !this.genderForm.valid) {
            return;
        }
        if (this.currentGender) {
            this.updateGenderHelper();
        } else {
            this.createGenderHelper();
        }
        this.genderForm.reset();
    }
}
