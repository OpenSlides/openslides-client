import { Service } from '@angular/core';
import { MotionEditor } from '@app/domain/models/motions/motion-editor';

import { ViewMotionEditor } from '../../../../site/pages/meetings/pages/motions/modules/editors/view-models/view-motion-editor';
import { BaseMotionMeetingUserRepositoryService } from '../util';
import { MotionEditorAction } from './motion-editor.action';

@Service()
export class MotionEditorRepositoryService extends BaseMotionMeetingUserRepositoryService<
    ViewMotionEditor,
    MotionEditor
> {
    protected actionDefs = MotionEditorAction;
    protected sortPayloadField = `motion_editor_ids`;

    public baseModelCtor = MotionEditor;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Motion editors` : `Motion editor`);
}
