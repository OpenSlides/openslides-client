import { inject, Service } from '@angular/core';
import { Fqid } from '@app/domain/definitions/key-types';
import { BaseMeetingRelatedRepository } from '@app/gateways/repositories/base-meeting-related-repository';
import { BaseViewModel } from '@app/site/base/base-view-model';
import {
    CollectionMappedTypes,
    CollectionMapperService,
    CollectionType
} from '@app/site/services/collection-mapper.service';
import { CollectionMapper } from '@app/site/services/collection-mapper.service/collection-mapper';
import { BehaviorSubject, Observable } from 'rxjs';

@Service()
export class MeetingCollectionMapperService extends CollectionMapperService implements CollectionMapper {
    private readonly _meetingRepositoriesSubject = new BehaviorSubject<BaseMeetingRelatedRepository<any, any>[]>([]);

    private collectionMapperService = inject(CollectionMapperService);

    public constructor() {
        super();
        this.collectionMapperService.getAllCollectionMaps().forEach(mapping => this.registerMeetingRepository(mapping));
        this.collectionMapperService.afterRepositoryRegistered.subscribe(mapping =>
            this.registerMeetingRepository(mapping)
        );
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
        for (const repo of this._meetingRepositoriesSubject.value) {
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
