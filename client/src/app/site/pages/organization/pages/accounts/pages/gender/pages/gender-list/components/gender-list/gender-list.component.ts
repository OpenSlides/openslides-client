import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';

import { GenderControllerService } from '../../../../services/gender-controller.service';
import { ViewGender } from '../../../../view-models/view-gender';

@Component({
    selector: `os-gender-list`,
    templateUrl: `./gender-list.component.html`,
    styleUrl: `./gender-list.component.scss`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenderListComponent extends BaseListViewComponent<ViewGender> {
    @ViewChild(`genderDialog`, { static: true })
    private genderDialog: TemplateRef<string> | null = null;

    private dialogRef: MatDialogRef<any> | null = null;

    /**
     * Holds the create form
     */
    public genderForm: UntypedFormGroup;
    private currentGender: ViewGender;

    public constructor(
        protected override translate: TranslateService,
        public repo: GenderControllerService,
        private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder
    ) {
        super();
        this.setTitle(`Gender`);
        this.canMultiSelect = true;
        this.genderForm = this.formBuilder.group({
            name: [``, Validators.required]
        });
    }

    public createGender(): void {
        this.editGender();
    }

    public editGender(genderView?: ViewGender): void {
        this.openGenderDialog(genderView);
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

    public async deleteGenders(...genders: ViewGender[]): Promise<void> {
        console.log(`XXX delete Gender`, genders);
    }

    public deleteSelectedGenders(): void {
        this.deleteGenders(...this.selectedRows);
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

    private updateGenderHelper(): void {
        if (this.currentGender) {
            const data = this.genderForm.value;
            this.repo.update(data, this.currentGender.id);
        }
    }

    private createGenderHelper(): void {
        this.repo.create(this.genderForm.value);
    }

    private deleteGender(gender: ViewGender): void {
        this.repo.delete(gender.id);
        //.then(() => this.cd.detectChanges())
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
