import { HasMeeting } from 'app/management/models/view-meeting';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { DetailNavigable } from 'app/site/base/detail-navigable';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewUser } from 'app/site/users/models/view-user';
import { Poll } from './poll';
import {
    MajorityMethodVerbose,
    PollClassType,
    PollClassTypeVerbose,
    PollMethodVerbose,
    PollPercentBaseVerbose,
    PollStateChangeActionVerbose,
    PollStateVerbose,
    PollType,
    PollTypeVerbose
} from './poll-constants';
import { Projectiondefault } from '../projector/projector';
import { ViewOption } from './view-option';

export class ViewPoll<C extends BaseViewModel = any> extends BaseProjectableViewModel<Poll> implements DetailNavigable {
    public get poll(): Poll {
        return this._model;
    }
    public static COLLECTION = Poll.COLLECTION;
    protected _collection = Poll.COLLECTION;

    public get pollClassType(): PollClassType | undefined {
        return this.content_object?.collection as PollClassType;
    }

    public get isAssignmentPoll(): boolean {
        return this.content_object?.collection === PollClassType.Assignment;
    }

    public get isMotionPoll(): boolean {
        return this.content_object?.collection === PollClassType.Motion;
    }

    public get pollmethodVerbose(): string {
        return PollMethodVerbose[this.pollmethod];
    }

    public get percentBaseVerbose(): string {
        return PollPercentBaseVerbose[this.onehundred_percent_base];
    }

    public get pollClassTypeVerbose(): string {
        return PollClassTypeVerbose[this.pollClassType];
    }

    public get stateVerbose(): string {
        return PollStateVerbose[this.state];
    }

    public get nextStateActionVerbose(): string {
        return PollStateChangeActionVerbose[this.nextState];
    }

    public get typeVerbose(): string {
        return PollTypeVerbose[this.type];
    }

    public get majorityMethodVerbose(): string {
        return MajorityMethodVerbose[this.majority_method];
    }

    public get wasVoted(): boolean {
        return this.user_has_voted;
    }

    public get amount_global_yes(): number {
        return this.global_option?.yes;
    }

    public get amount_global_no(): number {
        return this.global_option?.no;
    }

    public get amount_global_abstain(): number {
        return this.global_option?.abstain;
    }

    public canBeVotedFor(): boolean {
        return this.isStarted;
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.poll;
    }

    public getDetailStateURL(): string {
        if (this.content_object_id) {
            const routeFragments = this.content_object_id.split('/');
            return `/${this.getActiveMeetingId()}/${routeFragments[0]}s/${routeFragments[1]}`;
        } else {
            return '';
        }
    }

    public get hasVotes(): boolean {
        return this.results.flatMap(option => option.votes).some(vote => vote.weight > 0);
    }

    public hasVotedForDelegations(userId: number): boolean {
        return this.user_has_voted_for_delegations?.includes(userId);
    }

    public getContentObject(): C | undefined {
        return this.content_object;
    }

    public getSlide(): ProjectionBuildDescriptor {
        let projectionDefault: Projectiondefault;
        if (this.isMotionPoll) {
            projectionDefault = Projectiondefault.motionPoll;
        } else if (this.isAssignmentPoll) {
            projectionDefault = Projectiondefault.assignmentPoll;
        } else {
            projectionDefault = Projectiondefault.poll;
        }
        return {
            content_object_id: this.content_object_id,
            projectionDefault,
            getDialogTitle: this.getTitle
        };
    }

    private get results(): ViewOption[] {
        return (this.options || []).concat(this.global_option).filter(option => !!option);
    }
}

interface IPollRelations<C extends BaseViewModel = any> {
    content_object?: C;
    voted: ViewUser[];
    entitled_groups: ViewGroup[];
    options: ViewOption[];
    global_option: ViewOption;
}
export interface ViewPoll<C extends BaseViewModel = any> extends HasMeeting, IPollRelations<C>, Poll {}
