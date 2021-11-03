import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { ModelSubscription } from 'app/core/core-services/autoupdate.service';
import { MediafileRepositoryService } from 'app/core/repositories/mediafiles/mediafile-repository.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { toBase64 } from 'app/core/to-base64';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewGroup } from 'app/site/users/models/view-group';
import { BehaviorSubject } from 'rxjs';

/**
 * To hold the structure of files to upload
 */
interface FileData {
    mediafile: File;
    title: string;
    form: FormGroup;
}

@Component({
    selector: `os-media-upload-content`,
    templateUrl: `./media-upload-content.component.html`,
    styleUrls: [`./media-upload-content.component.scss`]
})
export class MediaUploadContentComponent extends BaseModelContextComponent implements OnInit, OnDestroy {
    /**
     * Columns to display in the upload-table
     */
    public vScrollColumns: PblColumnDefinition[] = [
        {
            prop: `title`,
            label: this.translate.instant(`Title`)
        },
        {
            prop: `filename`,
            label: this.translate.instant(`Filename`)
        },
        {
            prop: `information`,
            label: this.translate.instant(`Information`)
        },
        {
            prop: `access_groups`,
            label: this.translate.instant(`Access groups`)
        }
    ];

    /**
     * Determine wether to show the progress bar
     */
    public showProgress = false;

    /**
     * Consumable data source for the table
     */
    public uploadList: MatTableDataSource<FileData>;

    /**
     * Determine if uploading should happen parallel or synchronously.
     * Synchronous uploading might be necessary if we see that stuff breaks
     */
    @Input()
    public parallel = true;

    @Input()
    public directoryId: number | null | undefined;

    /**
     * Set if an error was detected to prevent automatic navigation
     */
    public errorMessage: string;

    /**
     * Hold the mat table to manually render new rows
     */
    @ViewChild(MatTable)
    public table: MatTable<any>;

    /**
     * Emits an event on success
     */
    @Output()
    public uploadSuccessEvent = new EventEmitter<number[]>();

    /**
     * Emits an error event
     */
    @Output()
    public errorEvent = new EventEmitter<string>();

    public directoryBehaviorSubject: BehaviorSubject<ViewMediafile[]>;
    public groupsBehaviorSubject: BehaviorSubject<ViewGroup[]>;

    public directorySelectionForm: FormGroup;

    public modelSubscription: ModelSubscription | null = null;

    /**
     * Constructor for the media upload page
     *
     * @param repo the mediafile repository
     * @param op the operator, to check who was the uploader
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private repo: MediafileRepositoryService,
        private formBuilder: FormBuilder,
        private groupRepo: GroupRepositoryService
    ) {
        super(componentServiceCollector, translate);
        this.directoryBehaviorSubject = this.repo.getDirectoryBehaviorSubject();
        this.groupsBehaviorSubject = this.groupRepo.getViewModelListBehaviorSubject();
    }

    /**
     * Init
     * Creates a new uploadList as consumable data source
     */
    public async ngOnInit(): Promise<void> {
        this.uploadList = new MatTableDataSource<FileData>();

        this.directorySelectionForm = this.formBuilder.group({
            directoryId: this.directoryId || null
        });

        // detect changes in the form
        this.subscriptions.push(
            this.directorySelectionForm.valueChanges.subscribe(formResult => {
                this.directoryId = formResult.directoryId;
            })
        );

        this.requestModels({
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [{ idField: `mediafile_ids`, fieldset: `fileCreation` }],
            fieldset: []
        });
    }

    public getDirectoryTitle(): string {
        return this.repo.getViewModel(this.directoryId)?.title;
    }

    /**
     * Returns the filetype from the file or a generic "File", if the type could
     * not be determinated.
     *
     * @param file The file to get the type from.
     */
    public getFiletype(file: File): string {
        return file.type || `File`;
    }

    /**
     * Converts a file size in byte into human readable format
     *
     * @param bytes file size in bytes
     * @returns a readable file size representation
     */
    public getReadableSize(bytes: number): string {
        if (bytes === 0) {
            return `0 B`;
        }
        const unitLevel = Math.floor(Math.log(bytes) / Math.log(1024));
        bytes = +(bytes / Math.pow(1024, unitLevel)).toFixed(2);
        return `${bytes} ${[`B`, `kB`, `MB`, `GB`, `TB`][unitLevel]}`;
    }

    /**
     * Change event to adjust the title
     *
     * @param newTitle the new title
     * @param file the given file
     */
    public onChangeTitle(newTitle: string, file: FileData): void {
        file.title = newTitle;
    }

    public getUploadFileFn(): (file: FileData) => Promise<Identifiable> {
        return async file => {
            const payload = {
                filename: file.mediafile.name,
                file: await toBase64(file.mediafile),
                title: file.title,
                parent_id: this.directoryId,
                access_group_ids: file.form.value.access_group_ids || []
            };
            return await this.repo.uploadFile(payload);
        };
    }

    public getAddFileFn(): (file: File) => FileData {
        return file => ({
            mediafile: file,
            title: file.name,
            form: this.formBuilder.group({
                access_group_ids: [[]]
            })
        });
    }
}
