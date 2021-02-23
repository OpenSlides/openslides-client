import { MotionPoll, MotionPollMethod } from 'app/shared/models/motions/motion-poll';
import { PercentBase } from 'app/shared/models/poll/base-poll';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ViewMotionOption } from 'app/site/motions/models/view-motion-option';
import { BaseViewPoll, PollClassType } from 'app/site/polls/models/base-view-poll';
import { ViewMotion } from './view-motion';

export const MotionPollMethodVerbose = {
    YN: 'Yes/No',
    YNA: 'Yes/No/Abstain'
};

export const MotionPollPercentBaseVerbose = {
    YN: 'Yes/No',
    YNA: 'Yes/No/Abstain',
    valid: 'All valid ballots',
    cast: 'All casted ballots',
    disabled: 'Disabled (no percents)'
};

export class ViewMotionPoll extends BaseViewPoll<MotionPoll, ViewMotionOption, MotionPollMethod, PercentBase> {
    public static COLLECTION = MotionPoll.COLLECTION;
    protected _collection = MotionPoll.COLLECTION;

    public readonly pollClassType = PollClassType.Motion;

    public get motionPoll(): MotionPoll {
        return this._model;
    }

    public get result(): ViewMotionOption {
        return this.options[0];
    }

    public get hasVotes(): boolean {
        return this.result && !!this.result.votes.length;
    }

    public getContentObject(): BaseViewModel {
        return this.motion;
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.motionPoll;
    }

    public get pollmethodVerbose(): string {
        return MotionPollMethodVerbose[this.pollmethod];
    }

    public get percentBaseVerbose(): string {
        return MotionPollPercentBaseVerbose[this.onehundred_percent_base];
    }

    public anySpecialVotes(): boolean {
        return this.result.yes < 0 || this.result.no < 0 || this.result.abstain < 0;
    }

    protected getDecimalFields(): string[] {
        return MotionPoll.DECIMAL_FIELDS;
    }
}
interface IMotionPollRelations {
    motion: ViewMotion;
}
export interface ViewMotionPoll extends MotionPoll, IMotionPollRelations {}
