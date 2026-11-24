import { inject, Service } from '@angular/core';
import { AssignmentPhase } from '@app/domain/models/assignments/assignment-phase';
import { HtmlToPdfService } from '@app/gateways/export/html-to-pdf.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { TranslateService } from '@ngx-translate/core';
import { Content, ContentColumns, ContentText } from 'pdfmake/interfaces';

import { PollPdfService } from '../../../modules/poll/services/poll-pdf.service';
import { UnknownUserLabel } from '../modules/assignment-poll/services/assignment-poll.service';
import { ViewAssignment } from '../view-models/view-assignment';

/**
 * Creates a PDF document from a single assignment
 */
@Service()
export class AssignmentPdfService {
    private translate = inject(TranslateService);
    private htmlToPdfService = inject(HtmlToPdfService);
    private pollPdfService = inject(PollPdfService);

    /**
     * Main function to control the pdf generation.
     * Calls all other functions to generate the PDF in multiple steps
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns a pdfmake compatible document as document
     */
    public assignmentToDocDef(assignment: ViewAssignment): Content[] {
        const title = this.createTitle(assignment);
        const preamble = this.createPreamble(assignment);
        const description = this.createDescription(assignment);
        const candidateList = this.createCandidateList(assignment);
        const pollResult = this.createPollResultTable(assignment.polls);

        return [title, preamble, description, candidateList, pollResult];
    }

    /**
     * Creates the title for PDF
     * TODO: Cleanup. Should be reused from time to time. Can be in another service
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns the title part of the document
     */
    private createTitle(assignment: ViewAssignment): ContentText {
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
    private createPreamble(assignment: ViewAssignment): Content {
        if (assignment.open_posts) {
            const preambleText = `${this.translate.instant(`Number of persons to be elected`)}: `;
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
        return [];
    }

    /**
     * Creates the  description part of the document. Also converts the parts of an assignment to PDF
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns the description of the assignment
     */
    private createDescription(assignment: ViewAssignment): Content {
        if (assignment.description) {
            const descriptionDocDef = this.htmlToPdfService.addPlainText(assignment.description);

            const descriptionText = `${this.translate.instant(`Description`)}: `;
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
            return [];
        }
    }

    /**
     * Creates the assignment list
     *
     * @param assignment the ViewAssignment to create the document for
     * @returns the assignment list as PDF document
     */
    private createCandidateList(assignment: ViewAssignment): ContentColumns | Content[] {
        if (assignment.phase !== AssignmentPhase.Finished) {
            const candidatesText = `${this.translate.instant(`Candidates`)}: `;
            const userList: Content[] = assignment.candidates.map(candidate => ({
                text: candidate.user?.full_name || UnknownUserLabel,
                margin: [0, 0, 0, 10]
            }));
            const listType: Content = assignment.number_poll_candidates ? { ol: userList } : { ul: userList };

            return {
                columns: [
                    {
                        text: candidatesText,
                        bold: true,
                        width: `25%`,
                        style: `textItem`
                    },
                    {
                        ...listType,
                        style: `textItem`
                    }
                ]
            };
        } else {
            return [];
        }
    }

    /**
     * Creates the poll result table for all published polls
     *
     * @param polls the ViewPoll objects to create the document for
     * @returns the table as pdfmake object
     */
    private createPollResultTable(polls: ViewPoll[]): Content {
        const resultBody = [];
        for (const poll of polls) {
            resultBody.push(this.pollPdfService.createResultsTable(poll));
            resultBody.push({
                text: ``,
                margin: [0, 0, 0, 7]
            });
        }

        return resultBody;
    }
}
