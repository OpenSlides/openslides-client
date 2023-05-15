import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { PollPercentBaseVerboseKey, PollTypeVerboseKey } from 'src/app/domain/models/poll';
import { OptionData, PollData } from 'src/app/domain/models/poll/generic-poll';
import { Poll } from 'src/app/domain/models/poll/poll';
import {
    ABSTAIN_KEY,
    CalculablePollKey,
    NO_KEY,
    PollMethod,
    PollPercentBase,
    PollType,
    YES_KEY
} from 'src/app/domain/models/poll/poll-constants';
import { PollKeyVerbosePipe, PollParseNumberPipe } from 'src/app/site/pages/meetings/modules/poll/pipes';
import { PollServiceMapperService } from 'src/app/site/pages/meetings/modules/poll/services/poll-service-mapper.service';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { ThemeService } from 'src/app/site/services/theme.service';

import { PollService } from '../../../../../modules/poll/services/poll.service/poll.service';
import { PollControllerService } from '../../../../../modules/poll/services/poll-controller.service/poll-controller.service';
import { AssignmentPollMethodKey, AssignmentPollMethodVerbose } from '../definitions';
import { AssignmentPollServiceModule } from './assignment-poll-service.module';

export const UnknownUserLabel = _(`Deleted user`);

/**
 * The assignment poll service should not have too much content since the poll system in OS4
 * perfectly fits on assignments. Motion polls are now the special case; assignment polls should
 * be the default case.
 */
@Injectable({ providedIn: AssignmentPollServiceModule })
export class AssignmentPollService extends PollService {
    public defaultPollMethod: PollMethod | undefined;
    public defaultPercentBase: PollPercentBase | undefined;
    public defaultPollType: PollType | undefined;
    public defaultGroupIds: number[] = [];

    public constructor(
        organizationSettingsService: OrganizationSettingsService,
        protected override translate: TranslateService,
        pollKeyVerbose: PollKeyVerbosePipe,
        parsePollNumber: PollParseNumberPipe,
        pollServiceMapper: PollServiceMapperService,
        private pollRepo: PollControllerService,
        private meetingSettingsService: MeetingSettingsService,
        themeService: ThemeService
    ) {
        super(organizationSettingsService, translate, pollKeyVerbose, parsePollNumber, themeService);
        pollServiceMapper.registerService(ViewAssignment.COLLECTION, this);
        this.meetingSettingsService
            .get(`assignment_poll_default_onehundred_percent_base`)
            .subscribe(base => (this.defaultPercentBase = base));
        this.meetingSettingsService
            .get(`assignment_poll_default_group_ids`)
            .subscribe(ids => (this.defaultGroupIds = ids));
        this.meetingSettingsService
            .get(`assignment_poll_default_method`)
            .subscribe(method => (this.defaultPollMethod = method));
        this.meetingSettingsService
            .get(`assignment_poll_default_type`)
            .subscribe(type => (this.defaultPollType = type));
        this.meetingSettingsService
            .get(`assignment_poll_sort_poll_result_by_votes`)
            .subscribe(sort => (this.sortByVote = sort));
        this.meetingSettingsService
            .get(`assignment_poll_enable_max_votes_per_option`)
            .subscribe(enable_max_votes_per_option => (this.enableMaxVotesPerOption = enable_max_votes_per_option));
    }

    public getDefaultPollData(contentObject?: Assignment): Partial<Poll> {
        const poll: Partial<Poll> = {
            title: this.translate.instant(`Ballot`),
            onehundred_percent_base: this.defaultPercentBase,
            entitled_group_ids: this.defaultGroupIds,
            pollmethod: this.defaultPollMethod,
            type: this.isElectronicVotingEnabled ? this.defaultPollType : PollType.Analog
        };

        if (contentObject) {
            const length = this.pollRepo.getViewModelListByContentObject(contentObject.fqid).length;
            if (length) {
                poll.title += ` (${length + 1})`;
            }
        }

        return poll;
    }

    /**
     * @deprecated Please rewrite this function
     *
     * @param key
     * @param value
     * @returns
     */
    public override getVerboseNameForValue(key: string, value: PollPercentBaseVerboseKey | PollTypeVerboseKey): string {
        switch (key) {
            case `pollmethod`:
                if (value in AssignmentPollMethodVerbose) {
                    return AssignmentPollMethodVerbose[value as AssignmentPollMethodKey];
                }
        }
        return super.getVerboseNameForValue(key, value);
    }

    protected override getPollDataFields(poll: PollData): CalculablePollKey[] {
        switch (poll.pollmethod) {
            case PollMethod.YNA: {
                return [YES_KEY, NO_KEY, ABSTAIN_KEY];
            }
            case PollMethod.YN: {
                return [YES_KEY, NO_KEY];
            }
            case PollMethod.N: {
                return [NO_KEY];
            }
            default: {
                return [YES_KEY];
            }
        }
    }

    protected override getPercentBase(poll: PollData, row?: OptionData): number {
        const base = poll.onehundred_percent_base as PollPercentBase;
        switch (base) {
            case PollPercentBase.Y:
                return this.getSumOptionsY(poll);
            default:
                return super.getPercentBase(poll, row);
        }
    }

    private getSumOptionsY(poll: PollData): number {
        if (!poll.options?.length) {
            return 0;
        }

        const generalOptions = (poll.global_option.abstain || 0) + (poll.global_option.no || 0);
        return poll.votesvalid - generalOptions;
    }
}
