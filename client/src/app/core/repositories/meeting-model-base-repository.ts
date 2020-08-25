import { ActiveMeetingService } from '../core-services/active-meeting.service';
import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { BaseRepository } from './base-repository';
import { BaseRepositoryWithActiveMeeting } from './base-repository-with-active-meeting';
import { BaseViewModel, ViewModelConstructor } from '../../site/base/base-view-model';
import { Identifiable } from '../../shared/models/base/identifiable';
import { RepositoryServiceCollector } from './repository-service-collector';

/**
 * Extension of the base repository for all meeting specific models. Provides access
 * to the active meeting service and automatically inserts the id on creates.
 */
export abstract class MeetingModelBaseRepository<
    V extends BaseViewModel,
    M extends BaseModel
> extends BaseRepositoryWithActiveMeeting<V, M> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        protected baseModelCtor: ModelConstructor<M>
    ) {
        super(repositoryServiceCollector, baseModelCtor);
    }

    /**
     * Creates a new model.
     * Provides a default procedure, but can be overwritten if required
     *
     * @param model the model to create on the server
     */
    public async create(model: Partial<M>): Promise<Identifiable> {
        const data = {
            meeting_id: this.activeMeetingService.meetingId,
            ...model
        };
        return super.create(data);
    }
}
