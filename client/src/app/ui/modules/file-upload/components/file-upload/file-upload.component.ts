import {
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import { FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';

export interface FileData extends Identifiable {
    mediafile: File;
    title: string;
    [key: string]: any;
}

const PBL_ROW_HEIGHT = 70;

let uniqueCounter = 0;

@Component({
    selector: `os-file-upload`,
    templateUrl: `./file-upload.component.html`,
    styleUrls: [`./file-upload.component.scss`]
})
export class FileUploadComponent {
    /**
     * Determine wether to show the progress bar
     */
    @Input()
    public showProgress = false;

    public get isEmpty(): boolean {
        return this._filesSubject.value.length === 0;
    }

    public get tableHeight(): string {
        return `${PBL_ROW_HEIGHT * (this._filesSubject.value.length + 1)}px`;
    }

    @ContentChild(TemplateRef, { static: true })
    public additionalContent: TemplateRef<any> | null = null;

    @ViewChild(`fileInput`) fileInput: ElementRef;

    /**
     * Determine if uploading should happen parallel or synchronously.
     * Synchronous uploading might be necessary if we see that stuff breaks
     */
    @Input()
    public parallel = false;

    public progressObservable = new BehaviorSubject<number>(0);

    public get isUploadDisabled(): boolean {
        return this._filesSubject.value.length === 0;
    }

    @Input()
    public uploadFileFn: (file: FileData) => Promise<Identifiable> = async () => ({ id: 0 });

    @Input()
    public addFileFn: ((file: File) => FileData) | null = null;

    @Output()
    public uploadSucceeded = new EventEmitter<Id[]>();

    @Output()
    public uploadFailured = new EventEmitter<string>();

    public get dataSource(): Observable<FileData[]> {
        return this._filesSubject;
    }

    private readonly _filesSubject = new BehaviorSubject<FileData[]>([]);

    private errorMessage = ``;

    private fileUploadedIds: Id[] = [];

    /**
     * Handler for the select file event
     *
     * @param event holds the file. Triggered by changing the file input element
     */
    public onSelectFile(event: any): void {
        if (event.target.files && event.target.files.length > 0) {
            // file list is a special kind of collection, so array.foreach does not apply
            for (const addedFile of event.target.files) {
                this.addFile(addedFile);
            }
        }

        this.fileInput.nativeElement.value = null;
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

    public async onUploadButton(): Promise<void> {
        const files = [...this._filesSubject.value];
        this.errorMessage = ``;
        this.showProgress = true;

        if (this.parallel) {
            const promises = files.map(file => this.uploadFile(file));
            await Promise.all(promises);
        } else {
            for (const file of files) {
                await this.uploadFile(file);
                this.progressObservable.next(this.calcUploadProgress(files.length));
            }
        }

        this.showProgress = false;

        if (this.errorMessage === ``) {
            this.uploadSucceeded.emit(this.fileUploadedIds);
        } else {
            const filenames = files.map(file => file.mediafile.name);
            this.uploadFailured.emit(`${this.errorMessage}\n${filenames}`);
        }
    }

    public onClearButton(): void {
        this._filesSubject.next([]);
    }

    public onRemoveButton(file: FileData): void {
        const files = this._filesSubject.value;
        const index = files.findIndex(f => f === file);
        if (index > -1) {
            files.splice(index, 1);
            this._filesSubject.next(files);
        }
    }

    /**
     * Calculate the progress to display in the progress bar
     * Only used in synchronous upload since parallel upload
     *
     * @returns the upload progress in percent.
     */
    public calcUploadProgress(uploadLength: number): number {
        if (this.fileUploadedIds && this.fileUploadedIds.length > 0) {
            return 100 / (uploadLength / this.fileUploadedIds.length);
        } else {
            return 0;
        }
    }

    private addFile(file: File): void {
        const fileData = this.addFileFn ? this.addFileFn(file) : this.createFileData(file);
        this._filesSubject.next(this._filesSubject.value.concat(fileData));
    }

    private async uploadFile(file: FileData): Promise<void> {
        if (this.uploadFileFn) {
            await this.uploadFileFn(file).then(
                uploadedFile => {
                    this.fileUploadedIds.push(uploadedFile.id);
                    this.onRemoveButton(file);
                },
                error => {
                    this.errorMessage = error;
                }
            );
        }
    }

    private createFileData(file: File): FileData {
        return {
            id: ++uniqueCounter,
            title: file.name,
            mediafile: file
        };
    }
}
