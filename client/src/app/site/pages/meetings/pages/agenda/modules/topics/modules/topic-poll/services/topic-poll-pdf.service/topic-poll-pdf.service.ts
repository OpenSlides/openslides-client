import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    AbstractPollData,
    BasePollPdfService
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-pdf.service';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

import { TopicControllerService } from '../../../../services/topic-controller.service';
import { ViewTopic } from '../../../../view-models';
import { TopicPollServiceModule } from '../topic-poll-service.module';

@Injectable({
    providedIn: TopicPollServiceModule
})
export class TopicPollPdfService extends BasePollPdfService {
    protected override translate = inject(TranslateService);
    private topicRepo = inject(TopicControllerService);

    public constructor() {
        super();
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
     * - a first, bold line with a title. Defaults to the label Topic, the number,
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
        const topic = this.topicRepo.getViewModel(viewPoll.content_object?.id)!;
        const fileName = `${this.translate.instant(`Topic`)} - ${topic.getTitle()} - ${this.translate.instant(
            `ballot-paper`
        )}`;
        if (!title) {
            title = `${this.translate.instant(`Topic`)} - ${topic.getTitle()}`;
            if (topic.polls.length > 1) {
                title += ` (${this.translate.instant(`Vote`)} ${topic.polls.length})`;
            }
        }

        const rowsPerPage = this.getRowsPerPage(viewPoll);
        const sheetend = Math.floor(417 / rowsPerPage);
        this.downloadWithBallotPaper(
            this.getPages(rowsPerPage, { sheetend, title, subtitle, poll: viewPoll }),
            fileName
        );
    }

    protected getPollResultFileNamePrefix(poll: ViewPoll): string {
        return (poll.content_object as ViewTopic)?.title;
    }

    /**
     * Creates one ballot in it's position on the page. Note that creating once
     * and then pasting the result several times does not work
     *
     * @param title The number of the motion
     * @param subtitle The actual motion title
     */
    protected createBallot(data: AbstractPollData): any {
        const options = data.poll.options.map(option => this.createBallotOption(option.text));

        return {
            stack: [this.getHeader(), this.getTitle(data.title), ...options],
            margin: [0, 0, 0, data.sheetend]
        };
    }
}
