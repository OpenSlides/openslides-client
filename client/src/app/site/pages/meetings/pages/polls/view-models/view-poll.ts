import { _ } from '@ngx-translate/core';
import { DetailNavigable } from 'src/app/domain/interfaces';
import {
    PollClassType,
    PollClassTypeVerbose,
    PollContentObject,
    PollData,
    PollMethod,
    PollPercentBaseVerbose,
    PollStateChangeActionVerbose,
    PollStateVerbose,
    PollType,
    PollTypeVerbose,
    RequiredMajorityBaseVerbose,
    VOTE_MAJORITY
} from 'src/app/domain/models/poll';
import { Poll } from 'src/app/domain/models/poll/poll';
import { PROJECTIONDEFAULT, ProjectiondefaultValue } from 'src/app/domain/models/projector/projection-default';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { ViewOption } from 'src/app/site/pages/meetings/pages/polls';
import { BaseProjectableViewModel, ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { MeetingSettingsService } from '../../../services/meeting-settings.service';
import { SlideOptions } from '../../../view-models/slide-options';

export class ViewPoll<C extends PollContentObject = any>
    extends BaseProjectableViewModel<Poll>
    implements DetailNavigable, PollData
{
    private _hasVoted: boolean | undefined;

    public get poll(): Poll {
        return this._model;
    }

    public static COLLECTION = Poll.COLLECTION;

    public set hasVoted(value: boolean | undefined) {
        this._hasVoted = value;
    }

    /**
     * @return boolean if a hasVoted state available undefined
     *         if the state is not set yet
     */
    public get hasVoted(): boolean | undefined {
        return this._hasVoted;
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

    public get requiredMajorityBaseVerbose(): string {
        return RequiredMajorityBaseVerbose[this.required_majority];
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
        const suffix = ``;
        if (this.is_pseudoanonymized && this.type === PollType.Named) {
            return _(`nominal (anonymized)`);
        }
        return PollTypeVerbose[this.type] + suffix;
    }

    public getContentObjectTitle(): string | null {
        return this.content_object?.getTitle() || null;
    }

    public canBeVotedFor(): boolean {
        return this.isStarted;
    }

    public getProjectiondefault(): ProjectiondefaultValue {
        return PROJECTIONDEFAULT.poll;
    }

    public override getDetailStateUrl(): string {
        if (this.getContentObject()) {
            return this.getContentObject()!.getDetailStateUrl();
        } else {
            return ``;
        }
    }

    public get hasVotes(): boolean {
        return this.results
            .flatMap(option => option.votes)
            .some(vote => vote.weight > 0 || +vote.weight === VOTE_MAJORITY);
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

    public override getProjectionBuildDescriptor(
        _meetingSettingsService?: MeetingSettingsService
    ): ProjectionBuildDescriptor {
        const choices = [
            { value: false, displayName: `Standard` },
            { value: true, displayName: `Single votes` }
        ];
        const slideOptions: SlideOptions =
            this.type === `named` &&
            !this.is_pseudoanonymized &&
            (this.isMotionPoll ||
                (this.isAssignmentPoll &&
                    !this.global_yes &&
                    this.pollmethod === PollMethod.Y &&
                    this.max_votes_amount === 1))
                ? [
                      {
                          key: `single_votes`,
                          displayName: _(`Which visualization?`),
                          default: !!this.live_voting_enabled,
                          choices
                      }
                  ]
                : [];
        return {
            content_object_id: this.fqid,
            projectionDefault: PROJECTIONDEFAULT.poll,
            type: `poll`,
            getDialogTitle: this.getTitle,
            slideOptions
        };
    }

    private get results(): ViewOption[] {
        return (this.options || []).concat(this.global_option).filter(option => !!option);
    }
}

interface IPollRelations<C extends PollContentObject = any> {
    content_object?: C;
    voted: ViewUser[];
    entitled_groups: ViewGroup[];
    options: ViewOption[];
    global_option: ViewOption;
}
export interface ViewPoll<C extends PollContentObject = any>
    extends HasMeeting, ViewModelRelations<IPollRelations<C>>, Poll {}
