import { MotionEditor } from '@app/domain/models/motions/motion-editor';
import { ViewModelRelations } from '@app/site/base/base-view-model';
import { BaseHasMeetingUserViewModel } from '@app/site/pages/meetings/base/base-has-meeting-user-view-model';

import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMotion } from '../../../view-models/view-motion';

export class ViewMotionEditor extends BaseHasMeetingUserViewModel<MotionEditor> {
    public static COLLECTION = MotionEditor.COLLECTION;
    protected _collection = MotionEditor.COLLECTION;

    public get motionEditor(): MotionEditor {
        return this._model;
    }
}
interface IMotionEditorRelations {
    motion: ViewMotion;
}
export interface ViewMotionEditor extends MotionEditor, ViewModelRelations<IMotionEditorRelations>, HasMeeting {}
