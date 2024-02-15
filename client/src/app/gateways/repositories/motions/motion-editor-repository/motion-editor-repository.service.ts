import { Injectable } from '@angular/core';
import { MotionEditor } from 'src/app/domain/models/motions/motion-editor';

import { ViewMotionEditor } from '../../../../site/pages/meetings/pages/motions/modules/editors/view-models/view-motion-editor';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';
import { BaseMotionMeetingUserRepositoryService } from '../util';
import { MotionEditorAction } from './motion-editor.action';

@Injectable({
    providedIn: `root`
})
export class MotionEditorRepositoryService extends BaseMotionMeetingUserRepositoryService<
    ViewMotionEditor,
    MotionEditor
> {
    protected sortPayloadField = `motion_editor_ids`;

    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MotionEditor, MotionEditorAction);
    }

    public getVerboseName = (plural = false) => this.translate.instant(plural ? `Editors` : `Editor`);
}
