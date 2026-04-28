import { _ } from '@ngx-translate/core';
import { DetailNavigable } from 'src/app/domain/interfaces';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { Motion } from 'src/app/domain/models/motions';
import { PollContentObject, VOTE_MAJORITY } from 'src/app/domain/models/poll';
import { BasePollConfigModel } from 'src/app/domain/models/poll/base-poll-config';
import { Poll } from 'src/app/domain/models/poll/poll';
import { PROJECTIONDEFAULT, ProjectiondefaultValue } from 'src/app/domain/models/projector/projection-default';
import { Topic } from 'src/app/domain/models/topics/topic';
import { ViewModelRelations } from 'src/app/site/base/base-view-model';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { ViewBallot, ViewPollOption } from 'src/app/site/pages/meetings/pages/polls';
import { BaseProjectableViewModel, ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models';
import { HasMeeting } from 'src/app/site/pages/meetings/view-models/has-meeting';

import { MeetingSettingsService } from '../../../services/meeting-settings.service';
import { SlideOptions } from '../../../view-models/slide-options';
import { ViewMeetingUser } from '../../../view-models/view-meeting-user';

export class ViewPoll<C extends PollContentObject = any>
    extends BaseProjectableViewModel<Poll>
    implements DetailNavigable
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

    public get isListPoll(): boolean {
        // return this.options[0]?.isListOption;
        // TODO: Decide by checking config type == `approval` and options present
        return !!this.options.length;
    }

    public get isAssignmentPoll(): boolean {
        return this.content_object?.collection === Assignment.COLLECTION;
    }

    public get isMotionPoll(): boolean {
        return this.content_object?.collection === Motion.COLLECTION;
    }

    public get isTopicPoll(): boolean {
        return this.content_object?.collection === Topic.COLLECTION;
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
        // TODO: Check results property
        return (
            this.results
                // .flatMap(option => option.votes)
                .some(vote => vote.weight > 0 || +vote.weight === VOTE_MAJORITY)
        );
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
            this.isNamed || this.isOpen
                ? [
                      {
                          key: `single_votes`,
                          displayName: _(`Which visualization?`),
                          default: !!this.published, // TODO: Check if poll is live vote enabled
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

    private get results(): ViewPollOption[] {
        // TODO: Concat gloabl option
        return (this.options || []).filter(option => !!option);
    }
}

interface IPollRelations<C extends PollContentObject = any, D extends BasePollConfigModel = any> {
    content_object?: C;
    config: D;
    voted: ViewMeetingUser[];
    ballots: ViewBallot[];
    entitled_groups: ViewGroup[];
    options: ViewPollOption[];
}
export interface ViewPoll<C extends PollContentObject = any, D extends BasePollConfigModel = any>
    extends HasMeeting, ViewModelRelations<IPollRelations<C, D>>, Poll {}
