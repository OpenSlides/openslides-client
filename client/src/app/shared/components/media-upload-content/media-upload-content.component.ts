import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { BehaviorSubject } from 'rxjs';

import { ModelSubscription } from 'app/core/core-services/autoupdate.service';
import { MediafileRepositoryService } from 'app/core/repositories/mediafiles/mediafile-repository.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { toBase64 } from 'app/core/to-base64';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { CreateMediafile } from 'app/shared/models/mediafiles/create-mediafile';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewGroup } from 'app/site/users/models/view-group';

/**
 * To hold the structure of files to upload
 */
interface FileData {
    mediafile: File;
    title: string;
    form: FormGroup;
}

@Component({
    selector: 'os-media-upload-content',
    templateUrl: './media-upload-content.component.html',
    styleUrls: ['./media-upload-content.component.scss']
})
export class MediaUploadContentComponent extends BaseModelContextComponent implements OnInit, OnDestroy {
    /**
     * Columns to display in the upload-table
     */
    public displayedColumns: string[] = ['title', 'filename', 'information', 'access_groups', 'remove'];

    /**
     * Determine wether to show the progress bar
     */
    public showProgress = false;

    /**
     * Consumable data source for the table
     */
    public uploadList: MatTableDataSource<FileData>;

    /**
     * Holds the IDs of the uploaded files
     */
    private filesUploadedIds: number[] = [];

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
        private repo: MediafileRepositoryService,
        private formBuilder: FormBuilder,
        private groupRepo: GroupRepositoryService,
        private router: Router
    ) {
        super(componentServiceCollector);
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
        this.directorySelectionForm.valueChanges.subscribe(formResult => {
            // undefined == none selection.
            if (formResult.directoryId || formResult.directoryId === undefined) {
                this.directoryId = formResult.directoryId || null;
                let url = '/mediafiles/upload';
                if (this.directoryId) {
                    url += `/${this.directoryId}`;
                }
                this.router.navigate([url], {
                    replaceUrl: true
                });
            }
        });

        this.requestModels({
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [{ idField: 'mediafile_ids', fieldset: 'fileCreation' }],
            fieldset: []
        });
    }

    public getDirectoryTitle(): string {
        return this.repo.getViewModel(this.directoryId)?.title;
    }

    /**
     * Converts given FileData into FormData format and hands it over to the repository
     * to upload
     *
     * @param fileData the file to upload to the server, should fit to the FileData interface
     */
    public async uploadFile(fileData: FileData): Promise<void> {
        const data = {
            filename: fileData.mediafile.name,
            file: await toBase64(fileData.mediafile),
            title: fileData.title,
            parent_id: this.directoryId,
            access_group_ids: fileData.form.value.access_group_ids || []
        };

        // raiseError will automatically ignore existing files
        await this.repo.uploadFile(data as CreateMediafile).then(
            fileId => {
                this.filesUploadedIds.push(fileId.id);
                // remove the uploaded file from the array
                this.onRemoveButton(fileData);
            },
            error => {
                this.errorMessage = error;
            }
        );
    }

    /**
     * Returns the filetype from the file or a generic "File", if the type could
     * not be determinated.
     *
     * @param file The file to get the type from.
     */
    public getFiletype(file: File): string {
        return file.type || 'File';
    }

    /**
     * Converts a file size in byte into human readable format
     *
     * @param bytes file size in bytes
     * @returns a readable file size representation
     */
    public getReadableSize(bytes: number): string {
        if (bytes === 0) {
            return '0 B';
        }
        const unitLevel = Math.floor(Math.log(bytes) / Math.log(1024));
        bytes = +(bytes / Math.pow(1024, unitLevel)).toFixed(2);
        return `${bytes} ${['B', 'kB', 'MB', 'GB', 'TB'][unitLevel]}`;
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

    /**
     * Add a file to list to upload later
     *
     * @param file the file to upload
     */
    public addFile(file: File): void {
        const newFile: FileData = {
            mediafile: file,
            title: file.name,
            form: this.formBuilder.group({
                access_group_ids: [[]]
            })
        };
        this.uploadList.data.push(newFile);

        if (this.table) {
            this.table.renderRows();
        }
    }

    /**
     * Handler for the select file event
     *
     * @param $event holds the file. Triggered by changing the file input element
     */
    public onSelectFile(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            // file list is a special kind of collection, so array.foreach does not apply
            for (const addedFile of event.target.files) {
                this.addFile(addedFile);
            }
        }
    }

    /**
     * Handler for the drop-file event
     *
     * @param event holds the file. Triggered by dropping in the area
     */
    public onDropFile(event: NgxFileDropEntry[]): void {
        for (const droppedFile of event) {
            // Check if the dropped element is a file. "Else" would be a dir.
            if (droppedFile.fileEntry.isFile) {
                const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
                fileEntry.file((file: File) => {
                    this.addFile(file);
                });
            }
        }
    }

    /**
     * Click handler for the upload button.
     * Iterate over the upload list and executes `uploadFile` on each element
     */
    public async onUploadButton(): Promise<void> {
        if (this.uploadList && this.uploadList.data.length > 0) {
            this.errorMessage = '';
            this.showProgress = true;

            if (this.parallel) {
                const promises = this.uploadList.data.map(file => this.uploadFile(file));
                await Promise.all(promises);
            } else {
                for (const file of this.uploadList.data) {
                    await this.uploadFile(file);
                }
            }
            this.showProgress = false;

            if (this.errorMessage === '') {
                this.uploadSuccessEvent.next(this.filesUploadedIds);
            } else {
                this.table.renderRows();
                const filenames = this.uploadList.data.map(file => file.mediafile.name);
                this.errorEvent.next(`${this.errorMessage}\n${filenames}`);
            }
        }
    }

    /**
     * Calculate the progress to display in the progress bar
     * Only used in synchronous upload since parallel upload
     *
     * @returns the upload progress in percent.
     */
    public calcUploadProgress(): number {
        if (this.filesUploadedIds && this.filesUploadedIds.length > 0 && this.uploadList.data) {
            return 100 / (this.uploadList.data.length / this.filesUploadedIds.length);
        } else {
            return 0;
        }
    }

    /**
     * Removes the given file from the upload table
     *
     * @param file the file to remove
     */
    public onRemoveButton(file: FileData): void {
        if (this.uploadList.data) {
            this.uploadList.data.splice(this.uploadList.data.indexOf(file), 1);
            this.table.renderRows();
        }
    }

    /**
     * Click handler for the clear button. Deletes the upload list
     */
    public onClearButton(): void {
        this.uploadList.data = [];
        if (this.table) {
            this.table.renderRows();
        }
    }
}
