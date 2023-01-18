import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    AbstractPollData,
    BasePollPdfService
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-pdf.service';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';

import { MotionControllerService } from '../../../../services/common/motion-controller.service/motion-controller.service';
import { MotionPollServiceModule } from '../motion-poll-service.module';

@Injectable({
    providedIn: MotionPollServiceModule
})
export class MotionPollPdfService extends BasePollPdfService {
    public constructor(
        meetingSettingsService: MeetingSettingsService,
        userRepo: ParticipantControllerService,
        activeMeetingService: ActiveMeetingService,
        mediaManageService: MediaManageService,
        pdfService: MeetingPdfExportService,
        protected override translate: TranslateService,
        private motionRepo: MotionControllerService
    ) {
        super(meetingSettingsService, userRepo, activeMeetingService, mediaManageService, pdfService, translate);
        this.meetingSettingsService
            .get(`motion_poll_ballot_paper_number`)
            .subscribe(count => (this.ballotCustomCount = count));
        this.meetingSettingsService
            .get(`motion_poll_ballot_paper_selection`)
            .subscribe(selection => (this.ballotCountSelection = selection));
    }

    /**
     * Triggers a pdf creation for this poll's ballots.
     * There will be 8 ballots per page.
     * Each ballot will contain:
     * - the event name and logo
     * - a first, bold line with a title. Defaults to the label Motion, the number,
     *   and the current number of polls for this motion (if more than one)
     * - a subtitle. A second, short (two lines, 90 characters) clarification for
     *   the ballot. Defaults to the beginning of the motion's title
     * - the options 'yes', 'no', 'abstain' translated to the client's language.
     *
     * @param viewPoll: The poll this ballot refers to
     * @param title (optional) a different title
     * @param subtitle (optional) a different subtitle
     */
    public printBallots(viewPoll: ViewPoll, title?: string, subtitle?: string): void {
        const motion = this.motionRepo.getViewModel(viewPoll.content_object?.id)!;
        const fileName = `${this.translate.instant(`Motion`)} - ${motion.number} - ${this.translate.instant(
            `ballot-paper`
        )}`;
        if (!title) {
            title = `${this.translate.instant(`Motion`)} - ${motion.number}`;
            if (motion.polls.length > 1) {
                title += ` (${this.translate.instant(`Vote`)} ${motion.polls.length})`;
            }
        }
        if (!subtitle) {
            subtitle = motion.title;
        }
        if (subtitle.length > 90) {
            subtitle = subtitle.substring(0, 90) + `...`;
        }
        const rowsPerPage = 4;
        this.downloadWithBallotPaper(
            this.getPages(rowsPerPage, { sheetend: 40, title, subtitle, poll: viewPoll }),
            fileName,
            this.logoUrl
        );
    }

    /**
     * Creates one ballot in it's position on the page. Note that creating once
     * and then pasting the result several times does not work
     *
     * @param title The number of the motion
     * @param subtitle The actual motion title
     */
    protected createBallot(data: AbstractPollData): any {
        return {
            stack: [
                this.getHeader(),
                this.getTitle(data.title),
                this.getSubtitle(data.subtitle),
                this.createBallotOption(this.translate.instant(`Yes`)),
                this.createBallotOption(this.translate.instant(`No`)),
                this.createBallotOption(this.translate.instant(`Abstain`))
            ],
            margin: [0, 0, 0, data.sheetend]
        };
    }
}
