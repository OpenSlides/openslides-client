import { Injectable } from '@angular/core';
import { MediafileAction } from 'app/core/actions/mediafile-action';
import { HttpService } from 'app/core/core-services/http.service';
import { AdditionalField } from 'app/core/core-services/model-request-builder.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Mediafile } from 'app/shared/models/mediafiles/mediafile';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseIsListOfSpeakersContentObjectRepository } from '../base-is-list-of-speakers-content-object-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

export const LOGO_FONT_VALUES: AdditionalField[] = [
    {
        templateField: `used_as_font_$_in_meeting_id`
    },
    {
        templateField: `used_as_logo_$_in_meeting_id`
    }
];

/**
 * Repository for MediaFiles
 */
@Injectable({
    providedIn: `root`
})
export class MediafileRepositoryService extends BaseIsListOfSpeakersContentObjectRepository<ViewMediafile, Mediafile> {
    private directoryBehaviorSubject: BehaviorSubject<ViewMediafile[]>;

    public constructor(repositoryServiceCollector: RepositoryServiceCollector, private http: HttpService) {
        super(repositoryServiceCollector, Mediafile);
        this.directoryBehaviorSubject = new BehaviorSubject([]);
        this.getViewModelListObservable().subscribe(mediafiles => {
            if (mediafiles) {
                this.directoryBehaviorSubject.next(mediafiles.filter(mediafile => mediafile.is_directory));
            }
        });

        this.viewModelSortFn = (a: ViewMediafile, b: ViewMediafile) => this.languageCollator.compare(a.title, b.title);
    }

    public getTitle = (viewMediafile: ViewMediafile) => viewMediafile.title;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Files` : `File`);

    public getFieldsets(): Fieldsets<Mediafile> {
        const fileSelectionFields: (keyof Mediafile)[] = [`title`, `is_directory`];
        const fileCreationFields: (keyof Mediafile)[] = fileSelectionFields.concat([`parent_id`, `child_ids`]);
        const listFields: (keyof Mediafile)[] = fileCreationFields.concat([
            `mimetype`,
            `filesize`,
            `create_timestamp`,
            `has_inherited_access_groups`,
            `pdf_information`
        ]);
        return {
            [DEFAULT_FIELDSET]: listFields,
            fileSelection: fileSelectionFields,
            fileCreation: fileCreationFields
        };
    }

    public getListObservableDirectory(parentId: number | null): Observable<ViewMediafile[]> {
        return this.getViewModelListObservable().pipe(
            map(mediafiles =>
                mediafiles.filter(mediafile => {
                    // instead of being null or undefined, for the root dir
                    // mediafile.parent_id is simply not the in object
                    if (!mediafile.parent_id && !parentId) {
                        return true;
                    } else {
                        return mediafile.parent_id === parentId;
                    }
                })
            )
        );
    }

    public async downloadArchive(archiveName: string, files: ViewMediafile[]): Promise<void> {
        const zip = new JSZip();
        for (const file of files) {
            if (!file.is_directory) {
                const base64Data = await this.http.downloadAsBase64(file.url);
                zip.file(file.title, base64Data, { base64: true });
            }
        }
        const archive = await zip.generateAsync({ type: `blob` });
        saveAs(archive, `${archiveName}.zip`);
    }

    public getDirectoryBehaviorSubject(): BehaviorSubject<ViewMediafile[]> {
        return this.directoryBehaviorSubject;
    }

    public async move(mediafiles: ViewMediafile[], directoryId: number | null): Promise<void> {
        const payload: MediafileAction.MovePayload = {
            ids: mediafiles.map(mediafile => mediafile.id),
            parent_id: directoryId,
            meeting_id: this.activeMeetingIdService.meetingId
        };
        return this.sendActionToBackend(MediafileAction.MOVE, payload);
    }

    /**
     * Deletes many files.
     *
     * @param mediafiles The users to delete
     */
    public async bulkDelete(mediafiles: ViewMediafile[]): Promise<void> {
        const payload = mediafiles.map(mediafile => ({ id: mediafile.id }));
        return this.sendBulkActionToBackend(MediafileAction.DELETE, payload);
    }

    public async uploadFile(partialMediafile: Partial<MediafileAction.CreateFilePayload>): Promise<Identifiable> {
        const payload: MediafileAction.CreateFilePayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            file: partialMediafile.file,
            filename: partialMediafile.filename,
            title: partialMediafile.title,
            access_group_ids: partialMediafile.access_group_ids,
            parent_id: partialMediafile.parent_id || null
        };
        return this.sendActionToBackend(MediafileAction.CREATE_FILE, payload);
    }

    public async createDirectory(partialMediafile: Partial<Mediafile>): Promise<Identifiable> {
        const payload: MediafileAction.CreateDirectoryPayload = {
            meeting_id: this.activeMeetingIdService.meetingId,
            title: partialMediafile.title,
            access_group_ids: partialMediafile.access_group_ids || [],
            parent_id: partialMediafile.parent_id
        };
        return this.sendActionToBackend(MediafileAction.CREATE_DIRECTORY, payload);
    }

    public async update(update: Partial<MediafileAction.UpdatePayload>, viewMediafile: ViewMediafile): Promise<void> {
        const payload: MediafileAction.UpdatePayload = {
            id: viewMediafile.id,
            access_group_ids: update.access_group_ids,
            title: update.title
        };
        return this.sendActionToBackend(MediafileAction.UPDATE, payload);
    }

    public async delete(viewMediafile: ViewMediafile): Promise<void> {
        return this.sendActionToBackend(MediafileAction.DELETE, { id: viewMediafile.id });
    }
}
