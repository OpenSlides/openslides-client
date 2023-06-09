import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PollMethod, PollTableData, VotingResult } from 'src/app/domain/models/poll';
import { OpenslidesHtmlToPdfService } from 'src/app/gateways/export/openslides-html-to-pdf';
import {
    PollKeyVerbosePipe,
    PollParseNumberPipe,
    PollPercentBasePipe
} from 'src/app/site/pages/meetings/modules/poll/pipes';
import { MeetingPdfExportService } from 'src/app/site/pages/meetings/services/export';

import { ViewPoll } from '../../../../../polls';
import { TopicPollService } from '../../modules/topic-poll/services/topic-poll.service';
import { ViewTopic } from '../../view-models';
import { TopicCommonServiceModule } from '../topic-common-service.module';

/**
 * Creates a PDF document from a single tpoic
 */
@Injectable({ providedIn: TopicCommonServiceModule })
export class TopicPdfService {
    public constructor(
        private translate: TranslateService,
        private htmlToPdfService: OpenslidesHtmlToPdfService,
        private pdfDocumentService: MeetingPdfExportService,
        private pollKeyVerbose: PollKeyVerbosePipe,
        private parsePollNumber: PollParseNumberPipe,
        private pollPercentBase: PollPercentBasePipe,
        private pollService: TopicPollService
    ) {}

    /**
     * Generates an pdf out of a given topic and saves it as file
     *
     * @param topic the topic to export
     */
    public exportSingleTopic(topic: ViewTopic): void {
        const doc = this.topicToDocDef(topic);
        const filename = `${this.translate.instant(`Topic`)}_${topic.title}`;
        const metadata = {
            title: filename
        };

        this.pdfDocumentService.download({ docDefinition: doc, filename, metadata });
    }

    /**
     * Main function to control the pdf generation.
     * Calls all other functions to generate the PDF in multiple steps
     *
     * @param topic the ViewTopic to create the document for
     * @returns a pdfmake compatible document as document
     */
    private topicToDocDef(topic: ViewTopic): object {
        const title = this.createTitle(topic);
        const text = this.createTextContent(topic);
        const pollResult = this.createPollResultTable(topic.polls);

        return [title, text, pollResult];
    }

    /**
     * Creates the title for PDF
     * TODO: Cleanup. Should be reused from time to time. Can be in another service
     *
     * @param topic the ViewTopic to create the document for
     * @returns the title part of the document
     */
    private createTitle(topic: ViewTopic): object {
        return {
            text: topic.title,
            style: `title`
        };
    }

    /**
     * Creates the  description part of the document. Also converts the parts of an topic to PDF
     *
     * @param topic the ViewTopic to create the document for
     * @returns the description of the topic
     */
    private createTextContent(topic: ViewTopic): object {
        if (topic.text) {
            return this.htmlToPdfService.addPlainText(topic.text);
        } else {
            return {};
        }
    }

    /**
     * Creates the poll result table for all published polls
     * TODO: Make this reusable (also used in assignment-pdf.service)
     *
     * @param polls the ViewPoll objects to create the document for
     * @returns the table as pdfmake object
     */
    private createPollResultTable(polls: ViewPoll[]): object {
        const resultBody = [];
        for (const poll of polls) {
            if (poll.isPublished) {
                const pollTableBody = [];

                resultBody.push({
                    text: poll.title,
                    bold: true,
                    style: `textItem`,
                    margin: [0, 15, 0, 0]
                });

                pollTableBody.push([
                    {
                        text: ``,
                        style: `tableHeader`
                    },
                    {
                        text: this.translate.instant(`Options`),
                        style: `tableHeader`
                    },
                    {
                        text: this.translate.instant(`Votes`),
                        style: `tableHeader`
                    }
                ]);

                const tableData = this.pollService.generateTableData(poll);
                for (const [index, pollResult] of tableData.entries()) {
                    const rank = pollResult.class === `user` ? index + 1 : ``;
                    const voteOption = this.translate.instant(this.pollKeyVerbose.transform(pollResult.votingOption));
                    const resultLine = this.getPollResult(pollResult, poll);
                    const tableLine = [
                        {
                            text: rank
                        },
                        {
                            text: voteOption
                        },
                        {
                            text: resultLine
                        }
                    ];

                    pollTableBody.push(tableLine);
                }

                resultBody.push({
                    table: {
                        widths: [`3%`, `61%`, `33%`],
                        headerRows: 1,
                        body: pollTableBody
                    },
                    layout: `switchColorTableLayout`
                });
            }
        }

        return resultBody;
    }

    /**
     * Converts pollData to a printable string representation
     */
    private getPollResult(votingResult: PollTableData, poll: ViewPoll): string {
        const resultList = votingResult.value
            .filter((singleResult: VotingResult) => {
                if (poll.pollmethod === PollMethod.Y) {
                    return singleResult.vote !== `no` && singleResult.vote !== `abstain`;
                } else if (poll.pollmethod === PollMethod.YN) {
                    return singleResult.vote !== `abstain`;
                } else {
                    return true;
                }
            })
            .map((singleResult: VotingResult) => {
                const votingKey = this.translate.instant(this.pollKeyVerbose.transform(singleResult.vote!));
                const resultValue = this.parsePollNumber.transform(singleResult.amount!);
                const resultInPercent = this.pollPercentBase.transform(singleResult.amount!, poll, votingResult);
                return `${votingKey}${!!votingKey ? `: ` : ``}${resultValue} ${
                    singleResult.showPercent && resultInPercent ? resultInPercent : ``
                }`;
            });
        return resultList.join(`\n`);
    }
}
