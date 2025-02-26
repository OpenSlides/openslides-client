import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Projector } from 'src/app/domain/models/projector/projector';
import { User } from 'src/app/domain/models/users/user';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';

import { PollSlideComponent } from '../../../poll-slide/components/poll-slide.component';
import {
    PollSlideData,
    PollSlideEntitledUsersEntry,
    SlidePollUser,
    SlidePollVote
} from '../../../poll-slide/poll-slide-data';

type VoteResult = `Y` | `N` | `A` | `X`;
const CHART_AREA_WIDTH = 450;
const CHART_AREA_HEIGHT = 300;
const ENTRY_HEIGHT = 50;
const TITLE_HEIGHT = 55;
const HEADER_FOOTER_HEIGHT = 105;
const NO_HEADER_TOP_MARGIN = 40;

interface FormattedVotesArea {
    left?: [string, VoteResult][][];
    center?: [string, VoteResult][][];
    right?: [string, VoteResult][][];
}

interface FormattedVotes {
    top?: FormattedVotesArea;
    center?: FormattedVotesArea;
    bottom?: FormattedVotesArea;
}

interface UserVotesFormat {
    columns: number;
    visibleRows: number;
    bufferLeft: number;
    bufferUp: number;
    chartColumns: number;
    chartRows: number;
    overflowPerColumn: number;
    additionalOverflowColumns: number;
}

@Component({
    selector: `os-motion-poll-single-votes-slide`,
    templateUrl: `./poll-single-votes-slide.component.html`,
    styleUrls: [`./poll-single-votes-slide.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollSingleVotesSlideComponent extends PollSlideComponent implements OnDestroy {
    public invalid = false;

    public override set projector(value: ViewProjector) {
        const old = super.projector;
        const isInit = !old !== !value;
        super.projector = value;
        if (
            isInit ||
            [`width`, `height`, `show_header_footer`].some((key: keyof Projector) => value[key] !== old[key])
        ) {
            this.formatUserVotes();
        }
    }

    public override get projector(): ViewProjector {
        return super.projector;
    }

    public gridStyle: { [key: string]: any } = {};

    public columnStyle: { [key: string]: any } = {};

    public bufferUp: number;
    public userVotesFormatted: FormattedVotes;

    private _maxColumns = 6;
    private _orderBy: keyof User = `last_name`;
    private _userVotes: [string, VoteResult][] = [];

    private _votes: {
        [key: string]: SlidePollVote;
    } = {};

    private _entitledUsers: {
        [key: string]: PollSlideEntitledUsersEntry;
    } = {};

    private _meetingSettingsSubscriptions: Subscription[];

    public constructor(
        private cd: ChangeDetectorRef,
        private meetingSettings: MeetingSettingsService,
        collectionMapperService: CollectionMapperService
    ) {
        super(collectionMapperService);
        this._meetingSettingsSubscriptions = [
            this.meetingSettings.get(`motion_poll_projection_max_columns`).subscribe(max => {
                this._maxColumns = max;
                this.formatUserVotes();
            }),
            this.meetingSettings.get(`motion_poll_projection_name_order_first`).subscribe(orderBy => {
                this._orderBy = orderBy;
                this.calculateUserVotes();
            })
        ];
    }

    public ngOnDestroy(): void {
        this._meetingSettingsSubscriptions.forEach(sub => sub.unsubscribe());
    }

    protected override setData(value: SlideData<PollSlideData>): void {
        const poll = value.data;
        if (poll && poll.options.length === 1) {
            this._votes =
                poll.options[0].votes?.mapToObject(vote => ({
                    [vote.user_id]: vote
                })) || {};
            this._entitledUsers =
                value.data.entitled_users_at_stop?.mapToObject(user => ({
                    [user.user_merged_into_id ?? user.user_id]: user
                })) || {};
            this.calculateUserVotes();
            this.invalid = false;
        } else {
            this.invalid = true;
        }
        super.setData(value);
    }

    private calculateUserVotes(): void {
        this._userVotes = Array.from(new Set([...Object.keys(this._votes), ...Object.keys(this._entitledUsers)]))
            .map(id => [
                ...(this.getNameAndSortValue(this._entitledUsers[id]?.user || this._votes[id]?.user, this._orderBy) || [
                    `User`,
                    `${id}`
                ]),
                this._votes[id] ? this._votes[id].value : `X`
            ])
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([user, _, vote]) => [user, vote as VoteResult]);
        this.formatUserVotes();
    }

    private getNameAndSortValue(user: SlidePollUser, by: keyof User): [string, string] {
        if (user == undefined) {
            return null;
        }

        const first = `${user.title ?? ``} ${user.first_name ?? ``}`.trim();
        if (first && user.last_name) {
            if (by === `last_name`) {
                return [`${user.last_name}, ${first}`, `${user.last_name}, ${user.first_name}`];
            }
            return [
                `${first} ${user.last_name}`,
                user.first_name ? `${user.first_name}, ${user.last_name}` : user.last_name
            ];
        }
        if (first) {
            if (by === `last_name`) {
                return [first, `${user.first_name}`];
            }
            return [first, user.first_name];
        }
        if (user.last_name) {
            if (by === `last_name`) {
                return [user.last_name, user.last_name];
            }
            return [user.last_name, `${user.last_name}`];
        }
        return null;
    }

    private formatUserVotes(): void {
        if (!this.projector || !this._userVotes) {
            return;
        }
        const format = this.getUserVotesFormat();
        this.bufferUp = format.bufferUp;
        this.calculateFormattedUserVotes(format);
        let templateColumns = `${format.chartColumns}fr`;
        if (format.bufferLeft) {
            templateColumns = `${format.bufferLeft}fr ${templateColumns} ${format.bufferLeft}fr`;
        }
        this.gridStyle = {
            [`grid-template-columns`]: templateColumns
        };
        this.columnStyle = {
            [`width`]: `${Math.floor(((this.projector?.width ?? 100) - 100) / format.columns - 5)}px`
        };
        this.cd.markForCheck();
    }

    private getUserVotesFormat(): UserVotesFormat {
        const visibleHeight =
            this.projector.height -
            TITLE_HEIGHT -
            (this.projector.show_header_footer ? HEADER_FOOTER_HEIGHT : NO_HEADER_TOP_MARGIN);
        const visibleRows = Math.floor(visibleHeight / ENTRY_HEIGHT);
        const chartRows = Math.min(Math.ceil(visibleRows * ((CHART_AREA_HEIGHT + 10) / visibleHeight)), visibleRows);
        const bufferUp = Math.floor((visibleRows - chartRows) / 2);
        const width = this.projector.width - 100;
        let [chartColumns, bufferLeft, maxVisibleEntries] = this.calculateEntryNumberForColumns(
            this._maxColumns,
            width,
            visibleRows,
            chartRows
        );
        let columns = this._maxColumns;
        if (maxVisibleEntries > this._userVotes.length) {
            for (let checkColumns = this._maxColumns - 1; checkColumns > 0; checkColumns--) {
                const [newChartColumns, newBufferLeft, newMaxVisibleEntries] = this.calculateEntryNumberForColumns(
                    checkColumns,
                    width,
                    visibleRows,
                    chartRows
                );
                if (newMaxVisibleEntries <= this._userVotes.length) {
                    columns = checkColumns + 1;
                    break;
                }
                [chartColumns, bufferLeft, maxVisibleEntries] = [newChartColumns, newBufferLeft, newMaxVisibleEntries];
            }
        }
        const overflow = this._userVotes.length - maxVisibleEntries;
        const overflowPerColumn = Math.floor(overflow / columns);
        const additionalOverflowColumns = overflow % columns;
        return {
            columns,
            visibleRows,
            bufferLeft,
            bufferUp,
            chartColumns,
            chartRows,
            overflowPerColumn,
            additionalOverflowColumns
        };
    }

    private calculateFormattedUserVotes(format: UserVotesFormat): void {
        const {
            columns,
            visibleRows,
            bufferLeft,
            bufferUp,
            chartColumns,
            chartRows,
            overflowPerColumn,
            additionalOverflowColumns
        } = format;
        const votesFormatted: FormattedVotes = [`top`, `center`, `bottom`].mapToObject(key => ({
            [key]: [`left`, `center`, `right`].mapToObject(innerKey => ({ [innerKey]: [] }))
        }));
        let nextIndex = 0;
        for (let i = 0; i < columns; i++) {
            const side: keyof FormattedVotesArea =
                i < bufferLeft ? `left` : i >= bufferLeft + chartColumns ? `right` : `center`;
            let untilIndex = Math.min(nextIndex + bufferUp, this._userVotes.length);
            votesFormatted.top[side].push(this._userVotes.slice(nextIndex, untilIndex));
            nextIndex = untilIndex;
            if (i < bufferLeft || i >= bufferLeft + chartColumns) {
                untilIndex = Math.min(nextIndex + chartRows, this._userVotes.length);
                votesFormatted.center[side].push(this._userVotes.slice(nextIndex, untilIndex));
                nextIndex = untilIndex;
            }
            untilIndex =
                nextIndex +
                visibleRows -
                bufferUp -
                chartRows +
                overflowPerColumn +
                (i < additionalOverflowColumns ? 1 : 0);
            votesFormatted.bottom[side].push(this._userVotes.slice(nextIndex, untilIndex));
            nextIndex = untilIndex;
        }
        this.userVotesFormatted = Object.entries(votesFormatted).mapToObject(
            ([key, area]: [keyof FormattedVotes, FormattedVotesArea]) => {
                if (Object.values(area).some(val => val.length)) {
                    return { [key]: Object.entries(area).mapToObject(([k, v]) => (v.length ? { [k]: v } : {})) };
                }
                return {};
            }
        );
    }

    /**
     * Calculates the chart column format for a specific number of columns.
     * @param maxColumns maximum intended number of columns
     * @param width available width for the layout
     * @param visibleRows amount of fully visible rows
     * @param chartRows amount of rows needed to display the chart
     * @returns a tuple with the number of necessary columns, the number of columns left of the chart and the number of entries that will fit the slide with these specifications. In that order.
     */
    private calculateEntryNumberForColumns(
        maxColumns: number,
        width: number,
        visibleRows: number,
        chartRows: number
    ): [number, number, number] {
        const spacePerColumn = Math.floor(width / maxColumns);
        let chartColumns = Math.min(Math.ceil((CHART_AREA_WIDTH + 10) / spacePerColumn), maxColumns);
        const bufferLeft = Math.floor((maxColumns - chartColumns) / 2);
        chartColumns = maxColumns - bufferLeft * 2;
        const maxVisibleEntries = chartColumns * (visibleRows - chartRows) + (maxColumns - chartColumns) * visibleRows;
        return [chartColumns, bufferLeft, maxVisibleEntries];
    }
}
