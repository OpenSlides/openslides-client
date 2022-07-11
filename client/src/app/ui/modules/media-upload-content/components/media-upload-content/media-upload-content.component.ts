import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';
import { toBase64 } from 'src/app/infrastructure/utils';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { MediafileControllerService } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { FileData } from '../../../file-upload/components/file-upload/file-upload.component';

let uniqueCounter = 0;

@Component({
    selector: `os-media-upload-content`,
    templateUrl: `./media-upload-content.component.html`,
    styleUrls: [`./media-upload-content.component.scss`]
})
export class MediaUploadContentComponent extends BaseUiComponent implements OnInit {
    /**
     * Determine wether to show the progress bar
     */
    public showProgress = false;

    /**
     * Determine if uploading should happen parallel or synchronously.
     * Synchronous uploading might be necessary if we see that stuff breaks
     */
    @Input()
    public parallel = true;

    @Input()
    public directoryId: number | null | undefined;

    @Input()
    public currentDirectory: ViewMediafile | null = null;

    @Input()
    public directories: Observable<ViewMediafile[]> | ViewMediafile[] = [];

    @Input()
    public uploadFn: (file: any) => Promise<Identifiable> = async () => ({ id: 0 });

    /**
     * Set if an error was detected to prevent automatic navigation
     */
    public errorMessage: string | null = null;

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

    public directorySelectionForm: UntypedFormGroup;

    public constructor(
        private formBuilder: UntypedFormBuilder,
        private translate: TranslateService,
        private repo: MediafileControllerService
    ) {
        super();
    }

    /**
     * Init
     * Creates a new uploadList as consumable data source
     */
    public async ngOnInit(): Promise<void> {
        // Initialize the form here to have already the directory id and current directory
        this.directorySelectionForm = this.formBuilder.group({
            directoryId: this.directoryId || null
        });
        // detect changes in the form
        this.subscriptions.push(
            this.directorySelectionForm.valueChanges.subscribe(formResult => {
                this.directoryId = formResult.directoryId;
            })
        );
    }

    public getDirectoryTitle(): string {
        return this.repo.getViewModel(this.directoryId)?.title || ``;
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
                access_group_ids: file[`form`].value.access_group_ids || []
            };
            return await this.uploadFn(payload);
        };
    }

    public getAddFileFn(): (file: File) => FileData {
        return file => ({
            id: ++uniqueCounter,
            mediafile: file,
            title: file.name,
            form: this.formBuilder.group({
                access_group_ids: [[]]
            })
        });
    }
}
