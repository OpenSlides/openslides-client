import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Content, StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';

import {
    ViewPoll,
    ViewPollConfigApproval,
    ViewPollConfigRatingApproval,
    ViewPollConfigRatingScore,
    ViewPollConfigSelection
} from '../../../../pages/polls';
import { MeetingPdfExportService } from '../../../../services/export';

@Injectable({
    providedIn: `root`
})
export class PollPdfService {
    private translate = inject(TranslateService);
    protected pdfExport = inject(MeetingPdfExportService);

    public downloadBallotPaper(poll: ViewPoll): void {
        const content = [this.getHeader(poll)];

        if (poll.config instanceof ViewPollConfigApproval) {
            content.push(this.approvalBallotForm(poll.config));
        } else if (poll.config instanceof ViewPollConfigSelection) {
            content.push(this.selectionBallotForm(poll.config));
        } else if (poll.config instanceof ViewPollConfigRatingApproval) {
            content.push(this.ratingApprovalBallotForm(poll.config));
        } else if (poll.config instanceof ViewPollConfigRatingScore) {
            content.push(this.ratingScoreBallotForm(poll.config));
        }

        const fileName = `${this.translate.instant(poll.content_object.getVerboseName())} - ${poll.content_object.getTitle()} - ${this.translate.instant(
            `ballot-paper`
        )}`;

        this.downloadWithBallotPaper(content, fileName);
    }

    /**
     * Downloads a pdf with the ballot papet page definitions.
     *
     * @param docDefinition the structure of the PDF document
     * @param filename the name of the file to use
     */
    private downloadWithBallotPaper(docDefinition: Content, filename: string): void {
        this.pdfExport.downloadWaitableDoc(filename, () => this.getBallotPaper(docDefinition));
    }

    /**
     * Overall document definition and styles for blank PDF documents
     * (e.g. ballots)
     *
     * @param documentContent the content of the pdf as object
     * @returns the pdf document definition ready to export
     */
    private async getBallotPaper(documentContent: Content): Promise<TDocumentDefinitions> {
        return {
            pageSize: `A4`,
            defaultStyle: {
                font: `PdfFont`,
                fontSize: 10
            },
            content: documentContent,
            styles: this.getBlankPaperStyles()
        };
    }

    protected getBlankPaperStyles(): StyleDictionary {
        return {
            committee_name: {
                fontSize: 16,
                bold: true
            },
            meeting_name: {
                fontSize: 12,
                bold: true
            },
            poll_name: {
                fontSize: 16,
                decoration: ['underline'],
                bold: true,
                margin: [0, 50]
            },
            poll_options: {
                fontSize: 14,
                bold: true
            },
            poll_option: {
                margin: [0, 5]
            },
            poll_option_score: {
                fontSize: 12,
                margin: [0, 5]
            },
            meta_info: {
                marginTop: 20,
                fontSize: 10,
                bold: true
            }
        };
    }

    private approvalBallotForm(config: ViewPollConfigApproval): Content {
        const poll = config.poll;
        const options = [
            this.createBallotOption(this.translate.instant(`Yes`)),
            this.createBallotOption(this.translate.instant(`No`))
        ];

        if (config.allow_abstain) {
            options.push(this.createBallotOption(this.translate.instant(`Abstain`)));
        }

        if (poll.options.length) {
            return [
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                {
                                    ol: poll.options.map(o => ({
                                        style: 'poll_option',
                                        text: o.getTitle()
                                    }))
                                }
                            ],
                            style: 'poll_options'
                        },
                        {
                            width: '*',
                            stack: options
                        }
                    ],
                    columnGap: 20
                }
            ];
        }

        return [options];
    }

    private selectionBallotForm(config: ViewPollConfigSelection): Content {
        const content = [];
        const poll = config.poll;
        for (const option of poll.options) {
            content.push(this.createBallotOption(option.text || option.meeting_user?.getTitle()));
        }

        content.push(this.getMeta(config.poll));
        return content;
    }

    private ratingApprovalBallotForm(config: ViewPollConfigRatingApproval): Content {
        const content = [];
        const poll = config.poll;
        content.push({
            columns: [
                {
                    width: `70%`,
                    text: ``
                },
                {
                    width: 40,
                    text: this.translate.instant(`Yes`),
                    alignment: `center`
                },
                {
                    width: 40,
                    text: this.translate.instant(`No`),
                    alignment: `center`
                },
                config.allow_abstain
                    ? {
                          width: 40,
                          text: this.translate.instant(`Abstain`),
                          alignment: `center`
                      }
                    : []
            ],
            columnGap: 20
        });
        for (const option of poll.options) {
            const BallotCircleDimensions = { yDistance: 6, size: 8 };
            content.push({
                margin: [0, 10, 0, 0],
                columns: [
                    {
                        width: `70%`,
                        text: option.text || option.meeting_user?.getTitle(),
                        style: `poll_option_score`
                    },
                    {
                        width: 40,
                        canvas: this.drawCircle(BallotCircleDimensions.yDistance, BallotCircleDimensions.size),
                        alignment: `center`
                    },
                    {
                        width: 40,
                        canvas: this.drawCircle(BallotCircleDimensions.yDistance, BallotCircleDimensions.size),
                        alignment: `center`
                    },
                    config.allow_abstain
                        ? {
                              width: 40,
                              canvas: this.drawCircle(BallotCircleDimensions.yDistance, BallotCircleDimensions.size),
                              alignment: `center`
                          }
                        : []
                ],
                style: `poll_options`,
                columnGap: 20
            });
        }

        content.push(this.getMeta(config.poll));
        return content;
    }

    private ratingScoreBallotForm(config: ViewPollConfigRatingScore): Content {
        const content = [];
        const poll = config.poll;
        for (const option of poll.options) {
            const BoxDimensions = { yDistance: 0, size: 22 };
            content.push({
                margin: [0, 10, 0, 0],
                columns: [
                    {
                        width: `70%`,
                        text: option.text || option.meeting_user?.getTitle(),
                        style: `poll_option_score`
                    },
                    {
                        width: BoxDimensions.size * 2 + 20,
                        canvas: [
                            {
                                type: `rect`,
                                x: 0,
                                y: BoxDimensions.yDistance,
                                lineColor: `black`,
                                w: BoxDimensions.size * 2,
                                h: BoxDimensions.size
                            }
                        ]
                    }
                ],
                style: `poll_options`,
                columnGap: 20
            });
        }

        content.push(this.getMeta(config.poll));
        return content;
    }

    private getHeader(poll: ViewPoll): Content {
        return [
            {
                text: poll.meeting.committee.name || ``,
                style: 'committee_name'
            },
            {
                text: poll.meeting.name || ``,
                style: 'meeting_name'
            },
            {
                text: poll.title || ``,
                style: 'poll_name'
            }
        ];
    }

    private getMeta(poll: ViewPoll): Content {
        const config = poll.config;
        if (config.min_options_amount > 1 || config.max_options_amount > 1) {
            const text = [];
            if (config.min_options_amount === config.max_options_amount) {
                text.push(this.translate.instant(`Select {{num}} options`, { num: config.min_options_amount }));
            } else {
                if (config.min_options_amount > 1 && config.max_options_amount > 1) {
                    text.push(
                        this.translate.instant(`Select at least {{min}} and no more than {{max}} options`, {
                            min: config.min_options_amount,
                            max: config.max_options_amount
                        })
                    );
                } else if (config.min_options_amount > 1) {
                    text.push(
                        this.translate.instant(`Select at least {{num}} options`, { num: config.min_options_amount })
                    );
                } else {
                    text.push(
                        this.translate.instant(`Select at most {{num}} options`, { num: config.max_options_amount })
                    );
                }
            }

            if (config instanceof ViewPollConfigRatingScore) {
                if (config.min_vote_sum === config.max_vote_sum) {
                    text.push(this.translate.instant(`Select {{num}} options`, { num: config.min_vote_sum }));
                } else {
                    if (config.min_vote_sum > 1 && config.max_vote_sum > 1) {
                        text.push(
                            this.translate.instant(`Cast at least {{min}} and no more than {{max}} votes`, {
                                min: config.min_vote_sum,
                                max: config.max_vote_sum
                            })
                        );
                    } else if (config.min_vote_sum > 1) {
                        text.push(this.translate.instant(`Cast at least {{num}} votes`, { num: config.min_vote_sum }));
                    } else {
                        text.push(
                            this.translate.instant(`Cast a maximum of {{num}} votes`, { num: config.max_vote_sum })
                        );
                    }
                }

                if (config.max_votes_per_option) {
                    text.push(
                        this.translate.instant(`Cast a maximum of {{num}} votes per option`, {
                            num: config.max_votes_per_option
                        })
                    );
                }
            }

            return {
                text: text.map(t => t + `\n`),
                style: ['meta_info']
            };
        }

        return [];
    }

    /**
     * Creates an entry for an option (a label with a circle)
     *
     * @returns pdfMake definitions
     */
    private createBallotOption(decision?: string): Content {
        const BallotCircleDimensions = { yDistance: 6, size: 8 };
        return {
            margin: [BallotCircleDimensions.size, 10, 0, 0],
            columns: [
                {
                    width: 15,
                    canvas: this.drawCircle(BallotCircleDimensions.yDistance, BallotCircleDimensions.size)
                },
                {
                    width: `auto`,
                    text: decision || ``
                }
            ]
        };
    }

    /**
     * Helper to draw a circle on its position on the ballot paper
     *
     * @param y vertical offset
     * @param size the size of the circle
     * @returns an array containing one circle definition for pdfMake
     */
    private drawCircle(y: number, size: number): any {
        return [
            {
                type: `ellipse`,
                x: 0,
                y,
                lineColor: `black`,
                r1: size,
                r2: size
            }
        ];
    }
}
