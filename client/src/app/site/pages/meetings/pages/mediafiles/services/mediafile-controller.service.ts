import { Injectable } from '@angular/core';
import { ViewMediafile } from '../view-models';
import { Mediafile } from 'src/app/domain/models/mediafiles/mediafile';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { MediafileRepositoryService } from 'src/app/gateways/repositories/mediafiles/mediafile-repository.service';
import { BaseController } from 'src/app/site/base/base-controller';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MediafileCommonServiceModule } from './mediafile-common-service.module';

@Injectable({ providedIn: MediafileCommonServiceModule })
export class MediafileControllerService extends BaseController<ViewMediafile, Mediafile> {
    constructor(
        protected override controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: MediafileRepositoryService
    ) {
        super(controllerServiceCollector, Mediafile, repo);
    }

    public move(files: Identifiable[], directoryId: Id | null): Promise<void> {
        return this.repo.move(files, directoryId);
    }

    public createDirectory(mediafile: Partial<Mediafile>): Promise<Identifiable> {
        return this.repo.createDirectory(mediafile);
    }

    public createFile(mediafile: any): Promise<Identifiable> {
        return this.repo.uploadFile(mediafile);
    }

    public update(update: any, mediafile: Identifiable): Promise<void> {
        return this.repo.update(update, mediafile);
    }

    public delete(...files: Identifiable[]): Promise<void> {
        return this.repo.delete(...files);
    }

    public getDirectoryObservable(parentId: Id | null): Observable<ViewMediafile[]> {
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

    public getDirectoryList(): ViewMediafile[] {
        return this.getViewModelList().filter(file => file.is_directory);
    }
}
