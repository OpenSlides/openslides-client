import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { HttpService } from 'app/core/core-services/http.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
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

    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
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

    public async getDirectoryIdByPath(pathSegments: string[]): Promise<number | null> {
        let parentId = null;

        const mediafiles = await this.unsafeViewModelListSubject.pipe(first(x => !!x)).toPromise();

        pathSegments.forEach(segment => {
            const mediafile = mediafiles.find(m => m.is_directory && m.title === segment && m.parent_id === parentId);
            if (!mediafile) {
                parentId = null;
                return;
            } else {
                parentId = mediafile.id;
            }
        });
        return parentId;
    }

    public getListObservableDirectory(parentId: number | null): Observable<ViewMediafile[]> {
        return this.getViewModelListObservable().pipe(
            map(mediafiles => {
                return mediafiles.filter(mediafile => mediafile.parent_id === parentId);
            })
        );
    }

    /**
     * Uploads a file to the server.
     * The HttpHeader should be Application/FormData, the empty header will
     * set the the required boundary automatically
     *
     * @param file created UploadData, containing a file
     * @returns the promise to a new mediafile.
     */
    public async uploadFile(file: any): Promise<Identifiable> {
        const emptyHeader = new HttpHeaders();
        throw new Error('TODO');
        // return this.httpService.post<Identifiable>('/rest/mediafiles/mediafile/', file, {}, emptyHeader);
    }

    public async downloadArchive(archiveName: string, files: ViewMediafile[]): Promise<void> {
        const zip = new JSZip();
        for (const file of files) {
            if (!file.is_directory) {
                const base64Data = await this.httpService.downloadAsBase64(file.url);
                zip.file(file.filename, base64Data, { base64: true });
            }
        }
        const archive = await zip.generateAsync({ type: 'blob' });
        saveAs(archive, archiveName);
    }

    public getDirectoryBehaviorSubject(): BehaviorSubject<ViewMediafile[]> {
        return this.directoryBehaviorSubject;
    }

    public async move(mediafiles: ViewMediafile[], directoryId: number | null): Promise<void> {
        // return await this.httpService.post('/rest/mediafiles/mediafile/move/', {
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
        // await this.httpService.post('/rest/mediafiles/mediafile/bulk_delete/', {
        //     ids: mediafiles.map(mediafile => mediafile.id)
        // });
        throw new Error('TODO');
    }
}
