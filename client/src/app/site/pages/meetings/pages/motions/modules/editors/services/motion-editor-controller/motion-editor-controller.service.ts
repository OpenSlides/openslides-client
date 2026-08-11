import { inject, Service } from '@angular/core';
import { MotionEditor } from '@app/domain/models/motions/motion-editor';
import { MotionEditorRepositoryService } from '@app/gateways/repositories/motions';

import { BaseMotionMeetingUserControllerService } from '../../../util';
import { ViewMotionEditor } from '../../view-models';

@Service()
export class MotionEditorControllerService extends BaseMotionMeetingUserControllerService<
    ViewMotionEditor,
    MotionEditor
> {
    protected override repo = inject(MotionEditorRepositoryService);

    public constructor() {
        super(MotionEditor);
    }
}
