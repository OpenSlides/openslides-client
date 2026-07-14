import { DetailNavigable } from '@app/domain/interfaces';
import { Assignment } from '@app/domain/models/assignments/assignment';
import { Motion } from '@app/domain/models/motions';
import { PollContentObject, PollState, PollVisibility } from '@app/domain/models/poll';
import { Poll } from '@app/domain/models/poll/poll';
import { PollConfigApproval } from '@app/domain/models/poll/poll-config-approval';
import { PROJECTIONDEFAULT, ProjectiondefaultValue } from '@app/domain/models/projector/projection-default';
import { Topic } from '@app/domain/models/topics/topic';
import { ViewModelRelations } from '@app/site/base/base-view-model';
import { ViewGroup } from '@app/site/pages/meetings/pages/participants';
import { ViewPollBallot, ViewPollOption } from '@app/site/pages/meetings/pages/polls';
import { BaseProjectableViewModel, ProjectionBuildDescriptor } from '@app/site/pages/meetings/view-models';
import { HasMeeting } from '@app/site/pages/meetings/view-models/has-meeting';
import { _ } from '@ngx-translate/core';

import { MeetingSettingsService } from '../../../services/meeting-settings.service';
import { SlideOptions } from '../../../view-models/slide-options';
import { ViewMeetingUser } from '../../../view-models/view-meeting-user';
import { BasePollConfigViewModel } from './base-poll-config-view-model';

export class ViewPoll<C extends PollContentObject = any>
    extends BaseProjectableViewModel<Poll>
    implements DetailNavigable
{
    public get poll(): Poll {
        return this._model;
    }

    public static COLLECTION = Poll.COLLECTION;

    public get isCreated(): boolean {
        return this.state === PollState.Created;
    }

    public get isStarted(): boolean {
        return this.state === PollState.Started;
    }

    public get isFinished(): boolean {
        return this.state === PollState.Finished;
    }

    public get isAnonymized(): boolean {
        return this.anonymized;
    }

    public get canAnonymize(): boolean {
        return !this.isAnonymized && !this.isAnalog && !this.isNamed && (this.isFinished || this.isPublished);
    }

    public get isPublished(): boolean {
        return this.state === PollState.Finished && this.published;
    }

    public get isAnalog(): boolean {
        return this.visibility === PollVisibility.Manually;
    }

    public get isNamed(): boolean {
        return this.visibility === PollVisibility.Named;
    }

    public get isOpen(): boolean {
        return this.visibility === PollVisibility.Open;
    }

    public get isAnonymous(): boolean {
        return this.visibility === PollVisibility.Secret;
    }

    public get isEVoting(): boolean {
        return this.isNamed || this.isOpen || this.isAnonymous;
    }

    public get nextState(): PollState | `published` {
        switch (this.state) {
            case PollState.Created:
                return PollState.Started;
            case PollState.Started:
                return PollState.Finished;
            case PollState.Finished:
                return `published`;
        }
    }

    public get isListPoll(): boolean {
        return this.config?.collection === PollConfigApproval.COLLECTION && !!this.options.length;
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
            return String(this.id);
        } else {
            return ``;
        }
    }

    public get hasVotes(): boolean {
        return !!this.config.parsedResult();
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
            (this.isNamed || this.isOpen) && this.live_voting_enabled
                ? [
                      {
                          key: `single_votes`,
                          displayName: _(`Which visualization?`),
                          default: !!this.published && this.live_voting_enabled,
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
}

interface IPollRelations<C extends PollContentObject = any, D extends BasePollConfigViewModel = any> {
    content_object?: C;
    config: D;
    voted: ViewMeetingUser[];
    ballots: ViewPollBallot[];
    entitled_groups: ViewGroup[];
    options: ViewPollOption[];
}
export interface ViewPoll<C extends PollContentObject = any, D extends BasePollConfigViewModel = any>
    extends HasMeeting, ViewModelRelations<IPollRelations<C, D>>, Poll {}
