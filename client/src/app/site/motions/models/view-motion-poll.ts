import { MotionPoll, MotionPollMethod } from 'app/shared/models/motions/motion-poll';
import { PercentBase } from 'app/shared/models/poll/base-poll';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { ViewMotionOption } from 'app/site/motions/models/view-motion-option';
import { BaseViewPoll, PollClassType } from 'app/site/polls/models/base-view-poll';
import { ViewMotion } from './view-motion';

export interface MotionPollTitleInformation {
    title: string;
}

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

export class ViewMotionPoll extends BaseViewPoll<MotionPoll, ViewMotionOption, MotionPollMethod, PercentBase>
    implements MotionPollTitleInformation {
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

    public getSlide(): ProjectorElementBuildDeskriptor {
        return {
            getBasicProjectorElement: options => ({
                name: MotionPoll.COLLECTION,
                id: this.id,
                getNumbers: () => ['name', 'id']
            }),
            slideOptions: [],
            projectionDefaultName: 'motion_poll',
            getDialogTitle: this.getTitle
        };
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
}
interface IMotionPollRelations {
    motion: ViewMotion;
}
export interface ViewMotionPoll extends MotionPoll, IMotionPollRelations {}
