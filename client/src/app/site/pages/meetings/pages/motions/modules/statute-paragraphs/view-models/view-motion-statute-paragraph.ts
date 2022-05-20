import { MotionStatuteParagraph } from '../../../../../../../../domain/models/motions/motion-statute-paragraph';
import { BaseViewModel } from '../../../../../../../base/base-view-model';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMotion } from '../../../view-models/view-motion';
export class ViewMotionStatuteParagraph extends BaseViewModel<MotionStatuteParagraph> /* implements Searchable */ {
    public static COLLECTION = MotionStatuteParagraph.COLLECTION;
    protected _collection = MotionStatuteParagraph.COLLECTION;

    public get statuteParagraph(): MotionStatuteParagraph {
        return this._model;
    }

    public override getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/motions/statute-paragraphs`;
    }
}
interface IMotionStatuteParagraphRelations {
    motions: ViewMotion[];
}
export interface ViewMotionStatuteParagraph
    extends MotionStatuteParagraph,
        IMotionStatuteParagraphRelations,
        HasMeeting {}
