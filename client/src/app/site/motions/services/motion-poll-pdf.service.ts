import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { AbstractPollData, PollPdfService } from 'app/core/pdf-services/base-poll-pdf-service';
import { PdfDocumentService } from 'app/core/pdf-services/pdf-document.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { MediaManageService } from 'app/core/ui-services/media-manage.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { MotionPoll } from 'app/shared/models/motions/motion-poll';

/**
 * Creates a pdf for a motion poll. Takes as input any motionPoll
 * Provides the public method `printBallots(motionPoll)` which should be convenient to use.
 *
 * @example
 * ```ts
 * this.MotionPollPdfService.printBallots(this.poll);
 * ```
 */
@Injectable({
    providedIn: 'root'
})
export class MotionPollPdfService extends PollPdfService {
    public constructor(
        meetingSettingsService: MeetingSettingsService,
        userRepo: UserRepositoryService,
        activeMeetingService: ActiveMeetingService,
        mediaManageService: MediaManageService,
        private translate: TranslateService,
        private motionRepo: MotionRepositoryService,
        private pdfService: PdfDocumentService
    ) {
        super(meetingSettingsService, userRepo, activeMeetingService, mediaManageService);
        this.meetingSettingsService
            .get('motion_poll_ballot_paper_number')
            .subscribe(count => (this.ballotCustomCount = count));
        this.meetingSettingsService
            .get('motion_poll_ballot_paper_selection')
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
     * @param motionPoll: The poll this ballot refers to
     * @param title (optional) a different title
     * @param subtitle (optional) a different subtitle
     */
    public printBallots(motionPoll: MotionPoll, title?: string, subtitle?: string): void {
        const motion = this.motionRepo.getViewModel(motionPoll.motion_id);
        const fileName = `${this.translate.instant('Motion')} - ${motion.number} - ${this.translate.instant(
            'ballot-paper'
        )}`;
        if (!title) {
            title = `${this.translate.instant('Motion')} - ${motion.number}`;
            if (motion.polls.length > 1) {
                title += ` (${this.translate.instant('Vote')} ${motion.polls.length})`;
            }
        }
        if (!subtitle) {
            subtitle = motion.title;
        }
        if (subtitle.length > 90) {
            subtitle = subtitle.substring(0, 90) + '...';
        }
        const rowsPerPage = 4;
        this.pdfService.downloadWithBallotPaper(
            this.getPages(rowsPerPage, { sheetend: 40, title: title, subtitle: subtitle }),
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
                this.createBallotOption(this.translate.instant('Yes')),
                this.createBallotOption(this.translate.instant('No')),
                this.createBallotOption(this.translate.instant('Abstain'))
            ],
            margin: [0, 0, 0, data.sheetend]
        };
    }
}
