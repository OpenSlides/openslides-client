import { ActiveMeetingIdService } from '../core-services/active-meeting-id.service';
import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { BaseRepository } from './base-repository';
import { BaseViewModel, ViewModelConstructor } from '../../site/base/base-view-model';
import { Identifiable } from '../../shared/models/base/identifiable';
import { RepositoryServiceCollector } from './repository-service-collector';

/**
 * Extension of the base repository for all meeting specific models. Provides access
 * to the active meeting service and automatically inserts the id on creates.
 */
export abstract class BaseRepositoryWithActiveMeeting<
    V extends BaseViewModel,
    M extends BaseModel
> extends BaseRepository<V, M> {
    protected get activeMeetingIdService(): ActiveMeetingIdService {
        return this.fullRepositoryServiceCollector.activeMeetingIdService;
    }

    public constructor(
        private fullRepositoryServiceCollector: RepositoryServiceCollector,
        protected baseModelCtor: ModelConstructor<M>
    ) {
        super(fullRepositoryServiceCollector, baseModelCtor);
    }
}
