import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Fqid } from 'src/app/domain/definitions/key-types';
import { BaseMeetingRelatedRepository } from 'src/app/gateways/repositories/base-meeting-related-repository';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import {
    CollectionMappedTypes,
    CollectionMapperService,
    CollectionType
} from 'src/app/site/services/collection-mapper.service';
import { CollectionMapper } from 'src/app/site/services/collection-mapper.service/collection-mapper';

@Injectable({
    providedIn: `root`
})
export class MeetingCollectionMapperService extends CollectionMapperService implements CollectionMapper {
    private readonly _meetingRepositoriesSubject = new BehaviorSubject<BaseMeetingRelatedRepository<any, any>[]>([]);

    public constructor(private collectionMapperService: CollectionMapperService) {
        super();
        collectionMapperService.getAllCollectionMaps().forEach(mapping => this.registerMeetingRepository(mapping));
        collectionMapperService.afterRepositoryRegistered.subscribe(mapping => this.registerMeetingRepository(mapping));
    }

    public getAllRepositoriesObservable(): Observable<BaseMeetingRelatedRepository<any, any>[]> {
        return this._meetingRepositoriesSubject;
    }

    public isMeetingSpecificCollection(obj: CollectionType): obj is BaseMeetingRelatedRepository<any, any> {
        const repo = this.collectionMapperService.getRepository(obj);
        if (!repo) {
            return false;
        }
        return repo instanceof BaseMeetingRelatedRepository && repo.resetOnMeetingChange;
    }

    public getViewModelByFqid(fqid: Fqid): BaseViewModel<any> | null {
        const collection = fqid.split(`/`)[0];
        const id = Number(fqid.split(`/`)[1]);
        for (let repo of this._meetingRepositoriesSubject.value) {
            if (repo.collection === collection) {
                return repo.getViewModel(id);
            }
        }
        return null;
    }

    private registerMeetingRepository(mapping: CollectionMappedTypes<any, any>): void {
        if (this.isMeetingSpecificCollection(mapping.repository)) {
            const oldValue = this._meetingRepositoriesSubject.value;
            this._meetingRepositoriesSubject.next(oldValue.concat(mapping.repository));
        }
    }
}
