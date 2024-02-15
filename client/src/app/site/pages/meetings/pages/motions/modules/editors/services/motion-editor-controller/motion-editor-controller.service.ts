import { Injectable } from '@angular/core';
import { MotionEditor } from 'src/app/domain/models/motions/motion-editor';
import { MotionEditorRepositoryService } from 'src/app/gateways/repositories/motions';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { BaseMotionMeetingUserControllerService } from '../../../util';
import { ViewMotionEditor } from '../../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionEditorControllerService extends BaseMotionMeetingUserControllerService<
    ViewMotionEditor,
    MotionEditor
> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        repo: MotionEditorRepositoryService,
        userRepo: UserControllerService
    ) {
        super(controllerServiceCollector, MotionEditor, repo, userRepo);
    }
}
