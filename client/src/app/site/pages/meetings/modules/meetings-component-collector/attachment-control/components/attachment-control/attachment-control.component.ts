import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    forwardRef,
    OnInit,
    Output,
    TemplateRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { map, Observable, OperatorFunction } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { Identifiable } from 'src/app/domain/interfaces';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { GroupControllerService, ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { BaseFormControlComponent } from 'src/app/ui/base/base-form-control';

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

    /**
     * The file list that is necessary for the `SearchValueSelector`
     */
    public mediaFileList: Observable<ViewMediafile[]> | null = null;

    public get uploadFn(): (file: any) => Promise<Identifiable> {
        return file => this.repo.createFile(file);
    }

    public get empty(): boolean {
        return !this.contentForm.value.length;
    }
    public get controlType(): string {
        return `attachment-control`;
    }

    public formGroup!: UntypedFormGroup;

    public get availableGroups(): Observable<ViewGroup[]> {
        return this.groupsRepo.getViewModelListObservable();
    }

    public get directoriesObservable(): Observable<ViewMediafile[]> {
        return this.repo.getDirectoryListObservable();
    }

    private dialogRef: MatDialogRef<any> | null = null;

    public constructor(
        formBuilder: UntypedFormBuilder,
        private dialogService: MatDialog,
        public readonly repo: MediafileControllerService,
        private groupsRepo: GroupControllerService
    ) {
        super(formBuilder);
    }

    public override ngOnInit(): void {
        this.subscriptions.push(
            this.formGroup.get(`mediafile_ids`)!.valueChanges.subscribe(value => {
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
        this.dialogRef?.close();
    }

    /**
     * Function to emit an occurring error.
     *
     * @param error The occurring error
     */
    public uploadError(error: string): void {
        this.errorHandler.emit(error);
    }

    protected createForm(): UntypedFormControl | UntypedFormGroup {
        this.formGroup = this.fb.group({ mediafile_ids: [] });
        return this.fb.control([]);
    }

    protected override initializeForm(): void {
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
