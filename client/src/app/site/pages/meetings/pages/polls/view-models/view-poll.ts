import { BehaviorSubject, Observable } from 'rxjs';
import { DetailNavigable } from 'src/app/domain/interfaces';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import {
    PollClassType,
    PollClassTypeVerbose,
    PollData,
    PollPercentBaseVerbose,
    PollStateChangeActionVerbose,
    PollStateVerbose,
    PollTypeVerbose
} from 'src/app/domain/models/poll';
import { Poll } from 'src/app/domain/models/poll/poll';
import { Projectiondefault } from 'src/app/domain/models/projector/projection-default';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { ViewOption } from 'src/app/site/pages/meetings/pages/polls';
import { BaseProjectableViewModel, ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

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

    public get isListPoll(): boolean {
        return this.options[0]?.isListOption;
    }

    public get isMotionPoll(): boolean {
        return this.content_object?.collection === PollClassType.Motion;
    }

    public get isTopicPoll(): boolean {
        return this.content_object?.collection === PollClassType.Topic;
    }

    public get percentBaseVerbose(): string {
        return PollPercentBaseVerbose[this.onehundred_percent_base];
    }

    public get pollClassTypeVerbose(): string {
        return this.pollClassType ? PollClassTypeVerbose[this.pollClassType] : ``;
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
        return this.content_object?.getTitle() || null;
    }

    public canBeVotedFor(): boolean {
        return this.isStarted;
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.poll;
    }

    public override getDetailStateUrl(): string {
        if (this.getContentObject()) {
            return this.getContentObject()!.getDetailStateUrl();
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

    public hasVotedForDelegations(userId?: number): boolean {
        if (!userId) {
            return false;
        }
        return this.user_has_voted_for_delegations?.includes(userId);
    }

    public getContentObject(): C | undefined {
        return this.content_object;
    }

    public getSlide(): ProjectionBuildDescriptor {
        return {
            content_object_id: this.content_object_id,
            projectionDefault: Projectiondefault.poll,
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
