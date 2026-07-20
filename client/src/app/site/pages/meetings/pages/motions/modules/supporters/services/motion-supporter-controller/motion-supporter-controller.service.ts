import { inject, Service } from '@angular/core';
import { Identifiable } from '@app/domain/interfaces';
import { MotionSupporter } from '@app/domain/models/motions/motion-supporter';
import { Action } from '@app/gateways/actions';
import { MotionSupporterRepositoryService } from '@app/gateways/repositories/motions/motion-supporter';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from '@app/site/services/user-controller.service';

import { ViewMotion } from '../../../../view-models';
import { ViewMotionSupporter } from '../../view-models/view-motion-supporter';

@Service()
export class MotionSupporterControllerService extends BaseMeetingControllerService<
    ViewMotionSupporter,
    MotionSupporter
> {
    protected override repo: MotionSupporterRepositoryService;
    private userRepo = inject(UserControllerService);

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(MotionSupporterRepositoryService);
        super(controllerServiceCollector, MotionSupporter, repo);
    }

    public create(motion: ViewMotion, ...users: Identifiable[]): Action<Identifiable[]> {
        const meetingUsers = users.map(user => this.userRepo.getViewModel(user.id)?.getMeetingUser(motion.meeting_id));
        return this.repo.create(motion, ...meetingUsers);
    }

    public delete(...models: Identifiable[]): Action<void> {
        return this.repo.delete(...models);
    }
}
