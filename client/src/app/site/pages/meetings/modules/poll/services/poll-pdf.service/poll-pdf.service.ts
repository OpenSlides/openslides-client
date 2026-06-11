import { Injectable } from '@angular/core';
import { Content, StyleDictionary } from 'pdfmake/interfaces';

import {
    ViewPoll,
    ViewPollConfigApproval,
    ViewPollConfigRatingApproval,
    ViewPollConfigRatingScore,
    ViewPollConfigSelection
} from '../../../../pages/polls';
import { AbstractPollData, BasePollPdfService } from './base-poll-pdf.service';

@Injectable({
    providedIn: `root`
})
export class PollPdfService extends BasePollPdfService {
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

        console.log(content);

        /*
         * TODO: Choose filename based on content object
         *
        const motion = this.motionRepo.getViewModel(poll.content_object)!;
        const fileName = `${this.translate.instant(`Motion`)} - ${poll.content_object.number} - ${this.translate.instant(
            `ballot-paper`
        )}`;

        */
        this.downloadWithBallotPaper(content, `filename`);
    }

    protected override createBallot(data: AbstractPollData): object {
        return {
            stack: [
                this.getTitle(data.title),
                this.getSubtitle(data.subtitle)
                // this.createBallotOption(this.translate.instant(`Yes`)),
                // this.createBallotOption(this.translate.instant(`No`)),
                // this.createBallotOption(this.translate.instant(`Abstain`))
            ]
            // margin: [0, 0, 0, data.sheetend]
        };
    }

    protected override getBlankPaperStyles(): StyleDictionary {
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
        // TODO: Only display abstain if enabled
        // TODO: Option header alignment needs improvement
        content.push({
            columns: [
                {
                    width: `70%`,
                    text: ``
                },
                {
                    width: 40,
                    text: this.translate.instant(`Yes`)
                },
                {
                    width: 40,
                    text: this.translate.instant(`No`)
                },
                {
                    width: 40,
                    text: this.translate.instant(`Abstain`)
                }
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
                        canvas: this.drawCircle(BallotCircleDimensions.yDistance, BallotCircleDimensions.size)
                    },
                    {
                        width: 40,
                        canvas: this.drawCircle(BallotCircleDimensions.yDistance, BallotCircleDimensions.size)
                    },
                    {
                        width: 40,
                        canvas: this.drawCircle(BallotCircleDimensions.yDistance, BallotCircleDimensions.size)
                    }
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
        /*
        let title = `${this.translate.instant(`Motion`)} - ${motion.number}`;
        if (motion.polls.length > 1) {
            title += ` (${this.translate.instant(`Vote`)} ${motion.polls.length})`;
        }
        let subtitle = motion.title;
        if (subtitle.length > 90) {
            subtitle = subtitle.substring(0, 90) + `...`;
        }
        */

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

    private getMeta(_poll: ViewPoll): Content {
        // TODO: Display relevant meta data of poll config
        return {
            text: 'Es sind mindestens 2 maximal 4 anzukreuzen',
            style: ['meta_info']
        };
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
