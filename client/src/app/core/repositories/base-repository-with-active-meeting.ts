import { ViewMeeting } from '../../management/models/view-meeting';
import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { BaseViewModel } from '../../site/base/base-view-model';
import { ActiveMeetingService } from '../core-services/active-meeting.service';
import { ActiveMeetingIdService } from '../core-services/active-meeting-id.service';
import { Id } from '../definitions/key-types';
import { BaseRepository } from './base-repository';
import { RepositoryServiceCollector } from './repository-service-collector';

/**
 * Extension of the base repository for all meeting specific models. Provides access
 * to the active meeting service and automatically inserts the id on viewmodel creates.
 */
export abstract class BaseRepositoryWithActiveMeeting<
    V extends BaseViewModel,
    M extends BaseModel
> extends BaseRepository<V, M> {
    protected get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    protected get activeMeetingIdService(): ActiveMeetingIdService {
        return this.fullRepositoryServiceCollector.activeMeetingIdService;
    }

    protected get activeMeeting(): ViewMeeting | undefined {
        return this.activeMeetingService.meeting;
    }

    protected get activeMeetingService(): ActiveMeetingService {
        return this.fullRepositoryServiceCollector.activeMeetingService;
    }

    protected get currentDefaultGroupId(): Id | null {
        return this.activeMeeting?.default_group_id;
    }

    protected get currentAdminGroupId(): Id | null {
        return this.activeMeeting?.admin_group_id;
    }

    public constructor(
        private fullRepositoryServiceCollector: RepositoryServiceCollector,
        protected baseModelCtor: ModelConstructor<M>
    ) {
        super(fullRepositoryServiceCollector, baseModelCtor);
    }

    protected createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.getActiveMeetingId = () => this.fullRepositoryServiceCollector.activeMeetingIdService.meetingId;
        return viewModel;
    }
}
