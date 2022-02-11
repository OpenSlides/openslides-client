import { HasMeeting } from 'app/management/models/view-meeting';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { DetailNavigable } from 'app/site/base/detail-navigable';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewUser } from 'app/site/users/models/view-user';
import { BehaviorSubject, Observable } from 'rxjs';

import { BaseModel } from '../base/base-model';
import { Projectiondefault } from '../projector/projector';
import { PollData } from './generic-poll';
import { Poll } from './poll';
import {
    AssignmentPollMethodVerbose,
    PollClassType,
    PollClassTypeVerbose,
    PollMethodVerbose,
    PollPercentBaseVerbose,
    PollStateChangeActionVerbose,
    PollStateVerbose,
    PollTypeVerbose
} from './poll-constants';
import { ViewOption } from './view-option';

export class ViewPoll<C extends BaseViewModel<BaseModel> = any>
    extends BaseProjectableViewModel<Poll>
    implements DetailNavigable, PollData
{
    public get poll(): Poll {
        return this._model;
    }
    public static COLLECTION = Poll.COLLECTION;

    public set hasVoted(value: boolean) {
        this._hasVotedSubject.next(value);
    }

    public get hasVoted(): boolean {
        return this._hasVotedSubject.value;
    }

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
        if (this.isAssignmentPoll) {
            return AssignmentPollMethodVerbose[this.pollmethod];
        } else if (this.isMotionPoll) {
            return PollMethodVerbose[this.pollmethod];
        }
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

    public getContentObjectTitle(): string | null {
        return this.content_object?.getTitle();
    }

    public canBeVotedFor(): boolean {
        return this.isStarted;
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.poll;
    }

    public getDetailStateURL(): string {
        if (this.content_object_id) {
            const routeFragments = this.content_object_id.split(`/`);
            return `/${this.getActiveMeetingId()}/${routeFragments[0]}s/${routeFragments[1]}`;
        } else {
            return ``;
        }
    }

    public getContentObjectDetailStateURL(): string {
        if (this.content_object_id) {
            return this.getContentObject().getDetailStateURL();
        } else {
            return ``;
        }
    }

    public get hasVotes(): boolean {
        return this.results.flatMap(option => option.votes).some(vote => vote.weight > 0);
    }

    public get hasVotedObservable(): Observable<boolean> {
        return this._hasVotedSubject.asObservable();
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

    private readonly _hasVotedSubject = new BehaviorSubject(false);
}

interface IPollRelations<C extends BaseViewModel<BaseModel> = any> {
    content_object?: C;
    voted: ViewUser[];
    entitled_groups: ViewGroup[];
    options: ViewOption[];
    options_as_observable: Observable<ViewOption[]>;
    global_option: ViewOption;
}
export interface ViewPoll<C extends BaseViewModel<BaseModel>> extends HasMeeting, IPollRelations<C>, Poll {}
