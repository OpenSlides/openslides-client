import { inject, Service } from '@angular/core';
import { MotionEditor } from '@app/domain/models/motions/motion-editor';
import { MotionEditorRepositoryService } from '@app/gateways/repositories/motions';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from '@app/site/services/user-controller.service';

import { BaseMotionMeetingUserControllerService } from '../../../util';
import { ViewMotionEditor } from '../../view-models';

@Service()
export class MotionEditorControllerService extends BaseMotionMeetingUserControllerService<
    ViewMotionEditor,
    MotionEditor
> {
    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(MotionEditorRepositoryService);
        const userRepo = inject(UserControllerService);
        super(controllerServiceCollector, MotionEditor, repo, userRepo);
    }
}
