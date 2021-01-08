import { ModificationType } from 'app/core/ui-services/diff.service';
import { MotionChangeRecommendation } from 'app/shared/models/motions/motion-change-reco';
import { HasMeeting } from 'app/site/event-management/models/view-meeting';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewMotion } from './view-motion';
import { ViewUnifiedChange, ViewUnifiedChangeType } from '../../../shared/models/motions/view-unified-change';

/**
 * Change recommendation class for the View
 *
 * Stores a motion including all (implicit) references
 * Provides "safe" access to variables and functions in {@link MotionChangeRecommendation}
 * @ignore
 */
export class ViewMotionChangeRecommendation
    extends BaseViewModel<MotionChangeRecommendation>
    implements ViewUnifiedChange {
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
        return 'recommendation-' + this.id.toString(10);
    }

    public getChangeType(): ViewUnifiedChangeType {
        return ViewUnifiedChangeType.TYPE_CHANGE_RECOMMENDATION;
    }

    public getLineFrom(): number {
        return this.line_from;
    }

    public getLineTo(): number {
        return this.line_to;
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
    extends MotionChangeRecommendation,
        IMotionChangeRecommendationRelations,
        HasMeeting {}
