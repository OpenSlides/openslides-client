import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { VoteValue } from 'src/app/domain/models/poll';
import {
    BasePollDetailComponent,
    BaseVoteData
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-detail.component';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';
import { ViewOption, ViewPoll, ViewVote } from 'src/app/site/pages/meetings/pages/polls';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

import { isSortedList, SortedList } from '../../../../../polls/view-models/sorted-list';
import {
    AssignmentPollService,
    UnknownUserLabel
} from '../../../../modules/assignment-poll/services/assignment-poll.service';
import { AssignmentPollDialogService } from '../../../../modules/assignment-poll/services/assignment-poll-dialog.service';
import { AssignmentPollPdfService } from '../../../../modules/assignment-poll/services/assignment-poll-pdf.service/assignment-poll-pdf.service';

@Component({
    selector: `os-assignment-poll-detail`,
    templateUrl: `./assignment-poll-detail.component.html`,
    styleUrls: [`./assignment-poll-detail.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AssignmentPollDetailComponent
    extends BasePollDetailComponent<ViewAssignment, AssignmentPollService>
    implements OnInit
{
    public filterProps = [`user.getFullName`];

    public isReady = false;

    public candidatesLabels: string[] = [];

    public get showResults(): boolean {
        return this.hasPerms() || this.poll.isPublished;
    }

    public constructor(
        pollService: AssignmentPollService,
        private pollDialog: AssignmentPollDialogService,
        pollPdfService: AssignmentPollPdfService
    ) {
        super(pollService, pollPdfService);
    }

    public openDialog(poll: ViewPoll): void {
        this.pollDialog.open(poll);
    }

    public override getUsersVoteDelegation(user: ViewUser): ViewUser {
        return super.getUsersVoteDelegation(user) as ViewUser;
    }

    protected createVotesData(): BaseVoteData[] {
        const votes: any = {};
        const pollOptions: ViewOption<ViewAssignment>[] = this.poll.options;
        for (const option of pollOptions) {
            for (const vote of option.votes) {
                const token = vote.user_token;
                if (!token) {
                    throw new Error(`assignment_vote/${vote.id} does not contain a user_token`);
                }
                if (!votes[token]) {
                    votes[token] = {
                        user: vote.user,
                        votes: []
                    };
                }

                if (vote.weight > 0) {
                    const optionContent: ViewUser | SortedList = option.content_object;
                    if (this.poll.isMethodY) {
                        votes[token].votes.push(this.getMethodYVoteLabel(vote, optionContent));
                    } else {
                        const candidate_name = isSortedList(optionContent)
                            ? optionContent?.getShortenedTitle(40)
                            : optionContent?.getShortName() ?? this.translate.instant(`Deleted user`);
                        votes[token].votes.push(
                            (pollOptions.length === 1 ? `` : `${candidate_name}: `) +
                                `${this.voteValueToLabel(vote.value)}`
                        );
                    }
                }
            }
        }
        for (const vote of this.poll.global_option.votes) {
            if (vote.weight > 0) {
                // global vote must be the only vote, so we can just ignore any previous value
                votes[vote.user_token] = {
                    user: vote.user,
                    votes: [`${this.translate.instant(`General`)}: ${this.voteValueToLabel(vote.value)}`]
                };
            }
        }
        return Object.values(votes);
    }

    protected override onAfterSetVotesData(): void {
        this.candidatesLabels = this.pollService.getChartLabels(this.poll);
        this.isReady = true;
        this.cd.markForCheck();
    }

    protected hasPerms(): boolean {
        return this.operator.hasPerms(Permission.assignmentCanManage);
    }

    protected onDeleted(): void {
        this.router.navigateByUrl(this.poll.getDetailStateUrl());
    }

    private voteValueToLabel(vote: VoteValue): string {
        if (vote === `Y`) {
            return this.translate.instant(`Yes`);
        } else if (vote === `N`) {
            return this.translate.instant(`No`);
        } else if (vote === `A`) {
            return this.translate.instant(`Abstain`);
        } else {
            throw new Error(`voteValueToLabel received illegal arguments: ${vote}`);
        }
    }

    private getMethodYVoteLabel(vote: ViewVote, optionContent: ViewUser | SortedList): string {
        if (this.poll.max_votes_per_option > 1) {
            // Show how often the option was selected
            return Math.floor(vote.weight).toString() + `x ` + this.getFullTitle(optionContent);
        } else {
            if (vote.value === `Y`) {
                return this.getFullTitle(optionContent);
            } else {
                return this.voteValueToLabel(vote.value);
            }
        }
    }

    private getFullTitle(optionContent: ViewUser | SortedList): string {
        if (isSortedList(optionContent)) {
            return optionContent?.getShortenedTitle(40);
        } else {
            return optionContent?.getFullName() ?? UnknownUserLabel;
        }
    }
}
