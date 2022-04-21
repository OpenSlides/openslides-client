import { ModificationType } from 'app/core/ui-services/diff.service';
import { HasMeeting } from 'app/management/models/view-meeting';
import { MotionChangeRecommendation } from 'app/shared/models/motions/motion-change-recommendation';

import { ViewUnifiedChange, ViewUnifiedChangeType } from '../../../shared/models/motions/view-unified-change';
import { BaseViewModel } from '../../base/base-view-model';
import { ViewMotion } from './view-motion';

/**
 * Change recommendation class for the View
 *
 * Stores a motion including all (implicit) references
 * Provides "safe" access to variables and functions in {@link MotionChangeRecommendation}
 * @ignore
 */
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
    extends MotionChangeRecommendation,
        IMotionChangeRecommendationRelations,
        HasMeeting {}
