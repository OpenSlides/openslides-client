import { inject, Service } from '@angular/core';
import { VOTE_MAJORITY, VOTE_UNDOCUMENTED } from '@app/domain/models/poll/poll-constants';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { OrganizationSettingsService } from '@app/site/pages/organization/services/organization-settings.service';
import { ThemeService } from '@app/site/services/theme.service';
import { TranslateService } from '@ngx-translate/core';

import { ActiveMeetingService } from '../../../../services/active-meeting.service';
import { MeetingSettingsService } from '../../../../services/meeting-settings.service';

@Service()
export abstract class PollService {
    protected enableMaxVotesPerOption = false;

    public get isElectronicVotingEnabled(): boolean {
        return this._isElectronicVotingEnabled;
    }

    private _isElectronicVotingEnabled = false;

    private organizationSettingsService = inject(OrganizationSettingsService);
    protected meetingSettingsService = inject(MeetingSettingsService);
    protected translate = inject(TranslateService);
    protected themeService = inject(ThemeService);
    protected activeMeeting = inject(ActiveMeetingService);

    public constructor() {
        this.organizationSettingsService
            .get(`enable_electronic_voting`)
            .subscribe(is => (this._isElectronicVotingEnabled = is));
    }

    public parseNumber(value?: number, maximumFractionDigits = 3): string {
        let lang = this.translate.getCurrentLang() ?? `en`;
        if (this.activeMeeting.meeting) {
            lang = this.activeMeeting.meeting.language;
        }
        const formatter = new Intl.NumberFormat(lang, {
            style: `decimal`,
            useGrouping: false,
            minimumFractionDigits: 0,
            maximumFractionDigits
        });

        switch (value) {
            case VOTE_MAJORITY:
                return this.translate.instant(`majority`);
            case undefined:
            case null:
                return formatter.format(0);
            case VOTE_UNDOCUMENTED:
                return this.translate.instant(`undocumented`);
            default:
                return formatter.format(value);
        }
    }

    public shouldShowChart(_poll: ViewPoll): boolean {
        return false;
    }

    public isVoteDocumented(vote: number): boolean {
        return vote !== null && vote !== undefined && vote !== VOTE_UNDOCUMENTED;
    }

    public isMaxVotesPerOptionEnabled(): boolean {
        return this.enableMaxVotesPerOption;
    }
}
