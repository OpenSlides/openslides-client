import { MotionChangeRecommendation } from '../../../../../../../../domain/models/motions/motion-change-recommendation';
import { ModificationType } from '../../../../../../../../domain/models/motions/motions.constants';
import { BaseViewModel, ViewModelRelations } from '../../../../../../../base/base-view-model';
import { HasMeeting } from '../../../../../view-models/has-meeting';
import { ViewMotion } from '../../../view-models/view-motion';
import { ViewUnifiedChangeType } from '../definitions';
import { ViewUnifiedChange } from './view-unified-change';
export class ViewMotionChangeRecommendation
    extends BaseViewModel<MotionChangeRecommendation>
    implements ViewUnifiedChange
{
    public static COLLECTION = MotionChangeRecommendation.COLLECTION;
    protected _collection = MotionChangeRecommendation.COLLECTION;

    public get changeRecommendation(): MotionChangeRecommendation {
        return this._model;
    }

    public updateChangeReco(type: ModificationType, text: string, internal: boolean): void {
        // @TODO HTML sanitazion
        this.changeRecommendation.type = type;
        this.changeRecommendation.text = text;
        this.changeRecommendation.internal = internal;
    }

    public getChangeId(): string {
        return `recommendation-` + this.id.toString(10);
    }

    public getIdentifier(): string {
        return this.id.toString(10);
    }

    public getChangeType(): ViewUnifiedChangeType {
        return ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION;
    }

    public getModificationType(): ModificationType {
        return this.type;
    }

    public getLineFrom(): number {
        return this.line_from + this.motion.firstLine - 1;
    }

    public getLineTo(): number {
        return this.line_to + this.motion.firstLine - 1;
    }

    public getChangeNewText(): string {
        return this.text;
    }

    public isAccepted(): boolean {
        return !this.rejected;
    }

    public isRejected(): boolean {
        return this.rejected;
    }

    public showInDiffView(): boolean {
        return true;
    }

    public showInFinalView(): boolean {
        return !this.rejected;
    }

    public isTitleChange(): boolean {
        return this.line_from === 0 && this.line_to === 0;
    }
}
interface IMotionChangeRecommendationRelations {
    motion: ViewMotion;
}
export interface ViewMotionChangeRecommendation
    extends MotionChangeRecommendation, ViewModelRelations<IMotionChangeRecommendationRelations>, HasMeeting {}
