import { Identifiable } from 'src/app/domain/interfaces';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { Action } from 'src/app/gateways/actions';
import { BaseHasMeetingUserViewModel } from 'src/app/site/pages/meetings/base/base-has-meeting-user-view-model';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

interface MotionMeetingUserActions {
    CREATE: string;
    DELETE: string;
    SORT: string;
}

export abstract class BaseMotionMeetingUserRepositoryService<
    V extends BaseHasMeetingUserViewModel<M>,
    M extends BaseModel
> extends BaseMeetingRelatedRepository<V, M> {
    protected abstract sortPayloadField: string;

    public constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        constructor: ModelConstructor<M>,
        private actionDefs: MotionMeetingUserActions
    ) {
        super(repositoryServiceCollector, constructor);
    }

    public getTitle = (model: V) => model?.user?.getTitle() || this.translate.instant(`Unknown participant`);

    public create(motion: Identifiable, ...meetingUsers: Identifiable[]): Action<Identifiable[]> {
        const payload = meetingUsers.map(user => ({
            meeting_user_id: user.id,
            motion_id: motion.id
        }));
        return this.createAction(this.actionDefs.CREATE, payload);
    }

    public delete(...models: Identifiable[]): Action<void> {
        const payload = models.map(model => ({
            id: model.id
        }));
        return this.createAction(this.actionDefs.DELETE, payload);
    }

    public sort(models: Identifiable[], motion: Identifiable): Action<void> {
        const payload = {
            [this.sortPayloadField]: models.map(model => model.id),
            motion_id: motion.id
        };
        return this.createAction(this.actionDefs.SORT, payload);
    }
}
