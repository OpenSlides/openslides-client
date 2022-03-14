import { ChangeDetectionStrategy, Component, EventEmitter, Output, TemplateRef } from '@angular/core';
import { forwardRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Permission } from 'app/core/core-services/permission';
import { MediafileRepositoryService } from 'app/core/repositories/mediafiles/mediafile-repository.service';
import { mediumDialogSettings } from 'app/shared/utils/dialog-settings';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseFormControlComponent } from '../base-form-control';

@Component({
    selector: `os-attachment-control`,
    templateUrl: `./attachment-control.component.html`,
    styleUrls: [`./attachment-control.component.scss`],
    providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AttachmentControlComponent), multi: true }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachmentControlComponent extends BaseFormControlComponent<ViewMediafile[]> implements OnInit {
    /**
     * Output for an error handler
     */
    @Output()
    public errorHandler: EventEmitter<string> = new EventEmitter();

    public readonly permission = Permission;

    private dialogRef: MatDialogRef<any>;

    /**
     * The file list that is necessary for the `SearchValueSelector`
     */
    public mediaFileList: Observable<ViewMediafile[]>;

    public get empty(): boolean {
        return !this.contentForm.value.length;
    }
    public get controlType(): string {
        return `attachment-control`;
    }

    public formGroup: FormGroup;

    public constructor(
        formBuilder: FormBuilder,
        private dialogService: MatDialog,
        public readonly mediaService: MediafileRepositoryService
    ) {
        super(formBuilder);
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.formGroup.get(`mediafile_ids`).valueChanges.subscribe(value => {
                this.push(value);
            })
        );
    }

    public getMediafilesPipeFn(): OperatorFunction<ViewMediafile[], ViewMediafile[]> {
        return map(mediafiles => mediafiles.filter(mediafile => !mediafile.is_directory));
    }

    /**
     * Function to open a given dialog
     *
     * @param dialog the dialog to open
     */
    public openUploadDialog(dialog: TemplateRef<string>): void {
        this.dialogRef = this.dialogService.open(dialog, { ...mediumDialogSettings, disableClose: false });
    }

    /**
     * Function to set the value for the `SearchValueSelector` after successful upload
     *
     * @param fileIDs a list with the ids of the uploaded files
     */
    public uploadSuccess(fileIDs: number[]): void {
        const newValues = [...this.contentForm.value, ...fileIDs];
        this.updateForm(newValues);
        this.dialogRef.close();
    }

    /**
     * Function to emit an occurring error.
     *
     * @param error The occurring error
     */
    public uploadError(error: string): void {
        this.errorHandler.emit(error);
    }

    protected initializeForm(): void {
        this.contentForm = this.fb.control([]);
        this.formGroup = this.fb.group({
            mediafile_ids: []
        });
    }

    protected updateForm(value: ViewMediafile[] | null): void {
        this.contentForm.setValue(value ?? []);
        this.formGroup.patchValue({
            mediafile_ids: value ?? []
        });
    }
}
