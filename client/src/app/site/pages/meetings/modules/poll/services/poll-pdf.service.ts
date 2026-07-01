import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Big from 'big.js';
import { Content } from 'pdfmake/interfaces';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import {
    ViewPollBallot,
    ViewPollConfigApproval,
    ViewPollConfigRatingApproval,
    ViewPollConfigRatingScore,
    ViewPollConfigSelection,
    ViewPollOption
} from 'src/app/site/pages/meetings/pages/polls';
import { ViewMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';

import { MeetingPdfExportService } from '../../../services/export';

@Injectable({
    providedIn: `root`
})
export class PollPdfService {
    private translate = inject(TranslateService);
    private pdfExport = inject(MeetingPdfExportService);

    public async exportResult(poll: ViewPoll): Promise<void> {
        const docDefinition = this.pollToDocDef(poll);
        const filename = `${this.translate.instant(`Poll`)}_${poll.getTitle()}`;
        const metadata = {
            title: filename
        };

        this.pdfExport.download({ docDefinition, filename, metadata });
    }

    /**
     * Converts a poll to PdfMake doc definition
     *
     * @param motion the poll to convert to pdf
     * @returns doc def for the poll
     */
    private pollToDocDef(poll: ViewPoll): Content[] {
        const pollResultPdfContent: Content[] = [
            {
                text: this.getTitle(poll),
                style: `title`
            }
        ];

        if ((poll.isFinished || poll.isPublished) && poll.result) {
            pollResultPdfContent.push({
                text: this.translate.instant(`Result`),
                margin: [0, 10, 0, 5],
                bold: true
            });
            pollResultPdfContent.push(this.createResultsTable(poll));
        }

        if (poll.ballots?.length && !poll.isAnalog) {
            pollResultPdfContent.push({
                text: this.translate.instant(`Single votes`),
                margin: [0, 20, 0, 5],
                bold: true
            });
            pollResultPdfContent.push(this.createVotesTable(poll));
        }

        return pollResultPdfContent;
    }

    /**
     * create a pdfmake definition for a title entry
     *
     * @param title
     * @returns pdfmake definition
     */
    private getTitle(poll: ViewPoll): string {
        const contentObjectTitle = poll.content_object?.getTitle();
        if (contentObjectTitle) {
            return `${contentObjectTitle} · ${poll.getTitle()}`;
        }
        return poll.getTitle();
    }

    /**
     * Creates the poll result table for the given poll
     *
     * @returns the table as pdfmake object
     */
    private createResultsTable(poll: ViewPoll): Content {
        const rows = this.createResultRows(poll);
        const pollTableBody: any[] = [
            [
                {
                    text: ``,
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Option`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Votes`),
                    style: `tableHeader`
                }
            ]
        ];

        let rank = 1;
        for (const row of rows) {
            pollTableBody.push([
                {
                    text: row.isSummary ? `` : rank++
                },
                {
                    text: row.label
                },
                {
                    text: row.value
                }
            ]);
        }

        return {
            table: {
                widths: [`6%`, `48%`, `46%`],
                headerRows: 1,
                body: pollTableBody
            },
            layout: `switchColorTableLayout`
        };
    }

    /**
     * Creates the poll vote table for the given votesData
     *
     * @returns the table as pdfmake object
     */
    private createVotesTable(poll: ViewPoll): Content {
        const optionMap = this.getOptionMap(poll.options);
        const sortedVotes = [...(poll.ballots || [])].sort((a, b) => {
            const aName = this.getBallotUserName(a.represented_meeting_user);
            const bName = this.getBallotUserName(b.represented_meeting_user);
            return aName.localeCompare(bName);
        });
        const showVoteWeight = sortedVotes.some(vote => +vote.weight !== 1 && vote.weight !== undefined);
        const pollTableBody: any[] = [
            [
                {
                    text: ``,
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Participant`),
                    style: `tableHeader`
                },
                ...(showVoteWeight
                    ? [
                          {
                              text: this.translate.instant(`Vote Weight`),
                              style: `tableHeader`
                          }
                      ]
                    : []),
                {
                    text: this.translate.instant(`Votes`),
                    style: `tableHeader`
                }
            ]
        ];

        let index = 1;
        for (const vote of sortedVotes) {
            const participant = this.getBallotParticipant(vote);
            const tableRow = [
                {
                    text: index++
                },
                {
                    text: participant
                },
                ...(showVoteWeight
                    ? [
                          {
                              text: this.formatNumber(vote.weight)
                          }
                      ]
                    : []),
                {
                    text: this.formatBallotValue(vote, poll, optionMap)
                }
            ];
            pollTableBody.push(tableRow);
        }

        return {
            table: {
                widths: showVoteWeight ? [`6%`, `38%`, `14%`, `42%`] : [`6%`, `44%`, `50%`],
                headerRows: 1,
                body: pollTableBody
            },
            layout: `switchColorTableLayout`
        };
    }

    private createResultRows(poll: ViewPoll): { label: string; value: string; isSummary?: boolean }[] {
        const config = poll.config;
        if (!config?.parsedResult()) {
            return [];
        }

        if (config instanceof ViewPollConfigApproval) {
            return this.createApprovalRows(config);
        }
        if (config instanceof ViewPollConfigSelection || config instanceof ViewPollConfigRatingScore) {
            return this.createSelectionRows(config, poll.options);
        }
        if (config instanceof ViewPollConfigRatingApproval) {
            return this.createRatingApprovalRows(config, poll.options);
        }

        return [];
    }

    private createApprovalRows(
        config: ViewPollConfigApproval
    ): { label: string; value: string; isSummary?: boolean }[] {
        const result = config.parsedResult();
        const rows = [
            {
                label: this.translate.instant(`Yes`),
                value: this.formatAmountAndPercent(+result.yes || 0, config.onehundredPercentBaseNum)
            },
            {
                label: this.translate.instant(`No`),
                value: this.formatAmountAndPercent(+result.no || 0, config.onehundredPercentBaseNum)
            }
        ];

        if (config.allow_abstain) {
            rows.push({
                label: this.translate.instant(`Abstain`),
                value: this.formatAmountAndPercent(+result.abstain || 0, config.onehundredPercentBaseNum)
            });
        }

        rows.push(...this.createSummaryRows(config));
        return rows;
    }

    private createSelectionRows(
        config: ViewPollConfigSelection | ViewPollConfigRatingScore,
        options: ViewPollOption[]
    ): { label: string; value: string; isSummary?: boolean }[] {
        const result = config.parsedResult();
        const rows: { label: string; value: string; isSummary?: boolean }[] = options
            .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
            .map(option => {
                const amount = +(result[option.id] || 0);
                return {
                    label: this.getOptionTitle(option),
                    value: this.formatAmountAndPercent(amount, config.onehundredPercentBaseNum)
                };
            });

        rows.push(...this.createSummaryRows(config));

        if (config instanceof ViewPollConfigSelection) {
            const selectionResult = config.parsedResult();
            if (config.allow_nota) {
                rows.push({
                    label: this.translate.instant(config.strike_out ? `General approval` : `General rejection`),
                    value: this.formatAmountAndPercent(+selectionResult.nota || 0, config.onehundredPercentBaseNum),
                    isSummary: true
                });
            }
            if (config.min_options_amount === 0) {
                rows.push({
                    label: this.translate.instant(`General abstain`),
                    value: this.formatAmountAndPercent(+selectionResult.abstain || 0, config.onehundredPercentBaseNum),
                    isSummary: true
                });
            }
        }

        return rows;
    }

    private createRatingApprovalRows(
        config: ViewPollConfigRatingApproval,
        options: ViewPollOption[]
    ): { label: string; value: string; isSummary?: boolean }[] {
        const result = config.parsedResult();
        const rows = options
            .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0))
            .map(option => {
                const optionResult = result[option.id] || {};
                const percentBase = config.getOptionOnehundredPercentBaseNum(option);
                const lines = [
                    `${this.translate.instant(`Yes`)}: ${this.formatAmountAndPercent(
                        +optionResult.yes || 0,
                        percentBase
                    )}`,
                    `${this.translate.instant(`No`)}: ${this.formatAmountAndPercent(+optionResult.no || 0, percentBase)}`
                ];
                if (config.allow_abstain) {
                    lines.push(
                        `${this.translate.instant(`Abstain`)}: ${this.formatAmountAndPercent(+optionResult.abstain || 0, percentBase)}`
                    );
                }
                return {
                    label: this.getOptionTitle(option),
                    value: lines.join(`\n`)
                };
            });

        rows.push(...this.createSummaryRows(config));
        return rows;
    }

    private createSummaryRows(
        config:
            | ViewPollConfigApproval
            | ViewPollConfigSelection
            | ViewPollConfigRatingApproval
            | ViewPollConfigRatingScore
    ): { label: string; value: string; isSummary?: boolean }[] {
        const rows = [];
        if (config.validBallots !== null && config.validBallots !== undefined) {
            rows.push({
                label: this.translate.instant(`Valid votes`),
                value: this.formatAmountAndPercent(config.validBallots, config.onehundredPercentBaseNum),
                isSummary: true
            });
        }
        if (config.invalidBallots !== null && config.invalidBallots !== undefined) {
            rows.push({
                label: this.translate.instant(`Invalid votes`),
                value: this.formatAmountAndPercent(config.invalidBallots, config.onehundredPercentBaseNum),
                isSummary: true
            });
        }
        rows.push({
            label: this.translate.instant(`Casted ballots`),
            value: this.formatNumber(config.parsedResult()?.total_ballots || 0),
            isSummary: true
        });
        return rows;
    }

    private formatAmountAndPercent(value: number, percentBase: number | null): string {
        if (!percentBase || percentBase <= 0) {
            return this.formatNumber(value);
        }
        const percent = Big(value).div(percentBase).mul(100).round(3).toString();
        return `${this.formatNumber(value)} (${percent}%)`;
    }

    private formatNumber(value: unknown): string {
        const num = Number(value ?? 0);
        const language = this.translate.getCurrentLang() || `en`;
        return new Intl.NumberFormat(language, {
            useGrouping: false,
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        }).format(Number.isFinite(num) ? num : 0);
    }

    private getOptionMap(options: ViewPollOption[]): Record<number, ViewPollOption> {
        const map: Record<number, ViewPollOption> = {};
        for (const option of options || []) {
            map[option.id] = option;
        }
        return map;
    }

    private formatBallotValue(
        ballot: ViewPollBallot,
        poll: ViewPoll,
        optionMap: Record<number, ViewPollOption>
    ): string {
        const parsed = ballot.parsedValue();

        if (parsed === `yes`) {
            return this.translate.instant(`Yes`);
        }
        if (parsed === `no`) {
            return this.translate.instant(`No`);
        }
        if (parsed === `abstain`) {
            return this.translate.instant(`Abstain`);
        }
        if (parsed === `nota`) {
            if (poll.config instanceof ViewPollConfigSelection && poll.config.strike_out) {
                return this.translate.instant(`General approval`);
            }
            return this.translate.instant(`General rejection`);
        }
        if (Array.isArray(parsed)) {
            if (!parsed.length) {
                return this.translate.instant(`General abstain`);
            }
            return parsed.map(optionId => this.getOptionTitle(optionMap[Number(optionId)])).join(`\n`);
        }
        if (typeof parsed === `object` && parsed !== null) {
            return Object.entries(parsed)
                .map(([optionId, value]) => {
                    const optionTitle = this.getOptionTitle(optionMap[Number(optionId)]);
                    return `${optionTitle}: ${this.translateBallotValue(value)}`;
                })
                .join(`\n`);
        }
        if (optionMap[Number(parsed)]) {
            return this.getOptionTitle(optionMap[Number(parsed)]);
        }

        return this.translateBallotValue(parsed);
    }

    private translateBallotValue(value: unknown): string {
        if (value === `yes`) {
            return this.translate.instant(`Yes`);
        }
        if (value === `no`) {
            return this.translate.instant(`No`);
        }
        if (value === `abstain`) {
            return this.translate.instant(`Abstain`);
        }
        return String(value ?? ``);
    }

    private getOptionTitle(option?: ViewPollOption): string {
        return option?.getTitle() || ``;
    }

    private getBallotUserName(meetingUser?: ViewMeetingUser): string {
        return meetingUser?.user?.getShortName() || this.translate.instant(`Anonymous`);
    }

    private getBallotParticipant(ballot: ViewPollBallot): string {
        const representedUser = ballot.represented_meeting_user;
        const actingUser = ballot.acting_meeting_user;
        const representedName = this.getBallotUserName(representedUser);

        if (actingUser?.id && representedUser?.id && actingUser.id !== representedUser.id) {
            return `${representedName}\n${this.translate.instant(`represented by`)} ${this.getBallotUserName(actingUser)}`;
        }

        return representedName;
    }
}
