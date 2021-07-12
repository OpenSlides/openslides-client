import { Injectable } from '@angular/core';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';

import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { OrganizationSettingsService } from 'app/core/ui-services/organization-settings.service';
import { Assignment } from 'app/shared/models/assignments/assignment';
import { Poll } from 'app/shared/models/poll/poll';
import { PollMethod, PollPercentBase, VOTE_UNDOCUMENTED } from 'app/shared/models/poll/poll-constants';
import { ViewOption } from 'app/shared/models/poll/view-option';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ParsePollNumberPipe } from 'app/shared/pipes/parse-poll-number.pipe';
import { PollKeyVerbosePipe } from 'app/shared/pipes/poll-key-verbose.pipe';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import {
    CalculablePollKey,
    PollData,
    PollDataOption,
    PollService,
    PollTableData,
    VotingResult
} from 'app/site/polls/services/poll.service';
import { ViewUser } from 'app/site/users/models/view-user';

export const UnknownUserLabel = _('Deleted user');
@Injectable({
    providedIn: 'root'
})
export class AssignmentPollService extends PollService {
    public defaultPollMethod: PollMethod;

    private sortByVote: boolean;

    public constructor(
        organizationSettingsService: OrganizationSettingsService,
        pollKeyVerbose: PollKeyVerbosePipe,
        parsePollNumber: ParsePollNumberPipe,
        protected translate: TranslateService,
        private pollRepo: PollRepositoryService,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super(organizationSettingsService, translate, pollKeyVerbose, parsePollNumber);
        this.meetingSettingsService
            .get('assignment_poll_default_100_percent_base')
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingSettingsService
            .get('assignment_poll_default_group_ids')
            .subscribe(ids => (this.defaultGroupIds = ids));
        this.meetingSettingsService
            .get('assignment_poll_default_method')
            .subscribe(method => (this.defaultPollMethod = method));
        this.meetingSettingsService
            .get('assignment_poll_default_type')
            .subscribe(type => (this.defaultPollType = type));
        this.meetingSettingsService
            .get('assignment_poll_sort_poll_result_by_votes')
            .subscribe(sort => (this.sortByVote = sort));
    }

    public getDefaultPollData(contentObject?: Assignment): Partial<Poll> {
        const poll = super.getDefaultPollData();

        poll.title = this.translate.instant('Ballot');
        poll.pollmethod = this.defaultPollMethod;

        if (contentObject) {
            const length = this.pollRepo.getViewModelListByContentObject(contentObject.fqid).length;
            if (length) {
                poll.title += ` (${length + 1})`;
            }
        }

        return poll;
    }

    public generateTableData(poll: ViewPoll<ViewAssignment>): PollTableData[] {
        const tableData: PollTableData[] = poll.options
            .sort((a, b) => {
                if (this.sortByVote) {
                    let compareValue;
                    if (poll.pollmethod === PollMethod.N) {
                        // least no on top:
                        compareValue = a.no - b.no;
                    } else {
                        // most yes on top
                        compareValue = b.yes - a.yes;
                    }

                    // Equal votes, sort by weight to have equal votes correctly sorted.
                    if (compareValue === 0 && a.weight && b.weight) {
                        // least weight on top
                        return a.weight - b.weight;
                    } else {
                        return compareValue;
                    }
                }

                // PollData does not have weight, we need to rely on the order of things.
                if (a.weight && b.weight) {
                    // least weight on top
                    return a.weight - b.weight;
                } else {
                    return 0;
                }
            })
            .map((candidate: ViewOption<ViewUser>) => {
                const pollTableEntry: PollTableData = {
                    class: 'user',
                    value: super.getVoteTableKeys(poll).map(
                        key =>
                            ({
                                vote: key.vote,
                                amount: candidate[key.vote],
                                icon: key.icon,
                                hide: key.hide,
                                showPercent: key.showPercent
                            } as VotingResult)
                    )
                };

                // Since pollData does not have any subtitle option
                if (candidate instanceof ViewOption && candidate.content_object) {
                    pollTableEntry.votingOption = candidate.content_object.short_name;
                    pollTableEntry.votingOptionSubtitle = candidate.content_object.getLevelAndNumber();
                } else if (candidate.content_object) {
                    pollTableEntry.votingOption = (candidate as PollDataOption).content_object.short_name;
                } else {
                    pollTableEntry.votingOption = UnknownUserLabel;
                }

                return pollTableEntry;
            });
        tableData.push(...this.formatVotingResultToTableData(this.getGlobalVoteKeys(poll), poll));
        tableData.push(...this.formatVotingResultToTableData(super.getSumTableKeys(poll), poll));

        return tableData;
    }

    public getPercentBase(poll: PollData): number {
        const base: PollPercentBase = poll.onehundred_percent_base as PollPercentBase;
        let totalByBase: number;
        switch (base) {
            case PollPercentBase.YN:
                totalByBase = this.sumOptionsYN(poll);
                break;
            case PollPercentBase.YNA:
                totalByBase = this.sumOptionsYNA(poll);
                break;
            case PollPercentBase.Y:
                totalByBase = this.sumOptionsYNA(poll);
                break;
            case PollPercentBase.Valid:
                totalByBase = poll.votesvalid;
                break;
            case PollPercentBase.Entitled:
                totalByBase = poll.entitled_users_at_stop?.length || 0;
                break;
            case PollPercentBase.Cast:
                totalByBase = poll.votescast;
                break;
            default:
                break;
        }
        return totalByBase;
    }

    public getChartLabels(poll: PollData): string[] {
        const fields = this.getPollDataFields(poll);
        return poll.options.map(option => {
            const votingResults = fields.map(field => {
                const voteValue = option[field];
                const votingKey = this.translate.instant(this.pollKeyVerbose.transform(field));
                const resultValue = this.parsePollNumber.transform(voteValue);
                const resultInPercent = this.getVoteValueInPercent(voteValue, poll);
                let resultLabel = `${votingKey}: ${resultValue}`;

                // 0 is a valid number in this case
                if (resultInPercent !== null) {
                    resultLabel += ` (${resultInPercent})`;
                }
                return resultLabel;
            });
            const optionName = option.content_object?.short_name ?? UnknownUserLabel;
            return `${optionName} · ${votingResults.join(' · ')}`;
        });
    }

    protected getResultFromPoll(poll: PollData, key: CalculablePollKey): number[] {
        return poll.options
            .concat(poll.global_option)
            .filter(option => !!option)
            .map(option => option[key]);
    }

    private getGlobalVoteKeys(poll: ViewPoll<ViewAssignment>): VotingResult[] {
        return [
            {
                vote: 'amount_global_yes',
                showPercent: this.showPercentOfValidOrCast(poll),
                hide:
                    poll.amount_global_yes === VOTE_UNDOCUMENTED ||
                    !poll.amount_global_yes ||
                    poll.pollmethod === PollMethod.N
            },
            {
                vote: 'amount_global_no',
                showPercent: this.showPercentOfValidOrCast(poll),
                hide: poll.amount_global_no === VOTE_UNDOCUMENTED || !poll.amount_global_no
            },
            {
                vote: 'amount_global_abstain',
                showPercent: this.showPercentOfValidOrCast(poll),
                hide: poll.amount_global_abstain === VOTE_UNDOCUMENTED || !poll.amount_global_abstain
            }
        ];
    }

    private formatVotingResultToTableData(resultList: VotingResult[], poll: PollData): PollTableData[] {
        return resultList
            .filter(key => {
                return !key.hide;
            })
            .map(key => ({
                votingOption: key.vote,
                class: 'sums',
                value: [
                    {
                        amount: poll[key.vote],
                        hide: key.hide,
                        showPercent: key.showPercent
                    } as VotingResult
                ]
            }));
    }

    private sumOptionsYN(poll: PollData): number {
        return poll.options.reduce((o, n) => {
            o += n.yes > 0 ? n.yes : 0;
            o += n.no > 0 ? n.no : 0;
            return o;
        }, 0);
    }

    private sumOptionsYNA(poll: PollData): number {
        return poll.options.reduce((o, n) => {
            o += n.abstain > 0 ? n.abstain : 0;
            return o;
        }, this.sumOptionsYN(poll));
    }
}
