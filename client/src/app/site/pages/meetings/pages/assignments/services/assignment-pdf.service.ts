import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AssignmentPhase } from 'src/app/domain/models/assignments/assignment-phase';
import { PollMethod, PollTableData, VotingResult } from 'src/app/domain/models/poll/poll-constants';
import { PollKeyVerbosePipe, PollParseNumberPipe, PollPercentBasePipe } from '../../../modules/poll/pipes';
import { ViewAssignment } from '../view-models';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { AssignmentPollService } from '../modules/assignment-poll/services/assignment-poll.service';
import { HtmlToPdfService } from 'src/app/gateways/export/html-to-pdf.service';
import { AssignmentExportServiceModule } from './assignment-export-service.module';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

/**
 * Creates a PDF document from a single assignment
 */
@Injectable({ providedIn: AssignmentExportServiceModule })
export class AssignmentPdfService {
    public constructor(
        private translate: TranslateService,
        private htmlToPdfService: HtmlToPdfService,
        private pollKeyVerbose: PollKeyVerbosePipe,
        private parsePollNumber: PollParseNumberPipe,
        private pollPercentBase: PollPercentBasePipe,
        private assignmentPollService: AssignmentPollService
    ) {}

    /**
     * Main function to control the pdf generation.
     * Calls all other functions to generate the PDF in multiple steps
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns a pdfmake compatible document as document
     */
    public assignmentToDocDef(assignment: ViewAssignment): object {
        const title = this.createTitle(assignment);
        const preamble = this.createPreamble(assignment);
        const description = this.createDescription(assignment);
        const candidateList = this.createCandidateList(assignment);
        const pollResult = this.createPollResultTable(assignment);

        return [title, preamble, description, candidateList, pollResult];
    }

    /**
     * Creates the title for PDF
     * TODO: Cleanup. Should be reused from time to time. Can be in another service
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns the title part of the document
     */
    private createTitle(assignment: ViewAssignment): object {
        return {
            text: assignment.title,
            style: `title`
        };
    }

    /**
     * Creates the preamble, usually just contains "Number of persons to be elected"
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns the preamble part of the pdf document
     */
    private createPreamble(assignment: ViewAssignment): object {
        const preambleText = `${_(`Number of persons to be elected`)}: `;
        const memberNumber = `` + assignment.open_posts;
        const preamble = {
            text: [
                {
                    text: preambleText,
                    bold: true,
                    style: `textItem`
                },
                {
                    text: memberNumber,
                    style: `textItem`
                }
            ]
        };
        return preamble;
    }

    /**
     * Creates the  description part of the document. Also converts the parts of an assignment to PDF
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns the description of the assignment
     */
    private createDescription(assignment: ViewAssignment): object {
        if (assignment.description) {
            const descriptionDocDef = this.htmlToPdfService.addPlainText(assignment.description);

            const descriptionText = `${_(`Description`)}: `;
            const description = [
                {
                    text: descriptionText,
                    bold: true,
                    style: `textItem`
                },
                descriptionDocDef
            ];
            return description;
        } else {
            return {};
        }
    }

    /**
     * Creates the assignment list
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns the assignment list as PDF document
     */
    private createCandidateList(assignment: ViewAssignment): object {
        if (assignment.phase !== AssignmentPhase.Finished) {
            const candidatesText = `${_(`Candidates`)}: `;
            const userList = assignment.candidates.map(candidate => ({
                text: candidate.user.full_name,
                margin: [0, 0, 0, 10]
            }));
            const listType = assignment.number_poll_candidates ? `ol` : `ul`;

            return {
                columns: [
                    {
                        text: candidatesText,
                        bold: true,
                        width: `25%`,
                        style: `textItem`
                    },
                    {
                        [listType]: userList,
                        style: `textItem`
                    }
                ]
            };
        } else {
            return {};
        }
    }

    /**
     * Creates the poll result table for all published polls
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns the table as pdfmake object
     */
    private createPollResultTable(assignment: ViewAssignment): object {
        const resultBody = [];
        for (const poll of assignment.polls) {
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
                        text: _(`Candidates`),
                        style: `tableHeader`
                    },
                    {
                        text: _(`Votes`),
                        style: `tableHeader`
                    }
                ]);

                const tableData = this.assignmentPollService.generateTableData(poll);
                for (const [index, pollResult] of tableData.entries()) {
                    const rank = pollResult.class === `user` ? index + 1 : ``;
                    const voteOption = _(this.pollKeyVerbose.transform(pollResult.votingOption));
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
                const votingKey = _(this.pollKeyVerbose.transform(singleResult.vote!));
                const resultValue = this.parsePollNumber.transform(singleResult.amount!);
                const resultInPercent = this.pollPercentBase.transform(singleResult.amount!, poll, votingResult);
                return `${votingKey}${!!votingKey ? `: ` : ``}${resultValue} ${
                    singleResult.showPercent && resultInPercent ? resultInPercent : ``
                }`;
            });
        return resultList.join(`\n`);
    }
}
