import { Identifiable } from 'src/app/domain/interfaces';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { Action } from 'src/app/gateways/actions';
import { BaseMotionMeetingUserRepositoryService } from 'src/app/gateways/repositories/motions/util';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { BaseHasMeetingUserViewModel } from '../../../base/base-has-meeting-user-view-model';
import { ViewMotion } from '../view-models';

export class BaseMotionMeetingUserControllerService<
    V extends BaseHasMeetingUserViewModel<M>,
    M extends BaseModel
> extends BaseMeetingControllerService<V, M> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        constructor: ModelConstructor<M>,
        protected override repo: BaseMotionMeetingUserRepositoryService<V, M>,
        private userRepo: UserControllerService
    ) {
        super(controllerServiceCollector, constructor, repo);
    }

    public create(motion: ViewMotion, ...users: Identifiable[]): Action<Identifiable[]> {
        const meetingUsers = users.map(user => this.userRepo.getViewModel(user.id)?.getMeetingUser(motion.meeting_id));
        return this.repo.create(motion, ...meetingUsers);
    }

    public delete(...models: Identifiable[]): Action<void> {
        return this.repo.delete(...models);
    }

    public sort(models: Identifiable[], motion: Identifiable): Action<void> {
        return this.repo.sort(models, motion);
    }
}
