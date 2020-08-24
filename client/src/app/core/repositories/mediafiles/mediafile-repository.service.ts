import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { HttpService } from 'app/core/core-services/http.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { CreateMediafile } from 'app/shared/models/mediafiles/create-mediafile';
import { Mediafile } from 'app/shared/models/mediafiles/mediafile';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { BaseIsListOfSpeakersContentObjectRepository } from '../base-is-list-of-speakers-content-object-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository for MediaFiles
 */
@Injectable({
    providedIn: 'root'
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

        this.viewModelSortFn = (a: ViewMediafile, b: ViewMediafile) => {
            return this.languageCollator.compare(a.title, b.title);
        };
    }

    public getTitle = (viewMediafile: ViewMediafile) => {
        return viewMediafile.title;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Files' : 'File');
    };

    public getFieldsets(): Fieldsets<Mediafile> {
        const fileSelectionFields: (keyof Mediafile)[] = ['title', 'is_directory'];
        const fileCreationFields: (keyof Mediafile)[] = fileSelectionFields.concat(['parent_id', 'child_ids']);
        const listFields: (keyof Mediafile)[] = fileCreationFields.concat([
            'mimetype',
            'filesize',
            'create_timestamp',
            'has_inherited_access_groups'
        ]);
        return {
            [DEFAULT_FIELDSET]: listFields,
            fileSelection: fileSelectionFields,
            fileCreation: fileCreationFields
        };
    }

    public getListObservableDirectory(parentId: number | null): Observable<ViewMediafile[]> {
        return this.getViewModelListObservable().pipe(
            map(mediafiles => {
                return mediafiles.filter(mediafile => {
                    // instead of being null or undefined, for the root dir
                    // mediafile.parent_id is simply not the in object
                    if (!mediafile.parent_id && !parentId) {
                        return true;
                    } else {
                        return mediafile.parent_id === parentId;
                    }
                });
            })
        );
    }

    public async create(mediafile: CreateMediafile): Promise<Identifiable> {
        return super.create(mediafile);
    }

    public async downloadArchive(archiveName: string, files: ViewMediafile[]): Promise<void> {
        throw new Error('TODO');
        /*const zip = new JSZip();
        for (const file of files) {
            if (!file.is_directory) {
                const base64Data = await this.http.downloadAsBase64(file.url);
                zip.file(file.filename, base64Data, { base64: true });
            }
        }
        const archive = await zip.generateAsync({ type: 'blob' });
        saveAs(archive, archiveName);*/
    }

    public getDirectoryBehaviorSubject(): BehaviorSubject<ViewMediafile[]> {
        return this.directoryBehaviorSubject;
    }

    public async move(mediafiles: ViewMediafile[], directoryId: number | null): Promise<void> {
        // return await this.http.post('/rest/mediafiles/mediafile/move/', {
        //     ids: mediafiles.map(mediafile => mediafile.id),
        //     directory_id: directoryId
        // });
        throw new Error('TODO');
    }

    /**
     * Deletes many files.
     *
     * @param mediafiles The users to delete
     */
    public async bulkDelete(mediafiles: ViewMediafile[]): Promise<void> {
        // await this.http.post('/rest/mediafiles/mediafile/bulk_delete/', {
        //     ids: mediafiles.map(mediafile => mediafile.id)
        // });
        throw new Error('TODO');
    }
}
