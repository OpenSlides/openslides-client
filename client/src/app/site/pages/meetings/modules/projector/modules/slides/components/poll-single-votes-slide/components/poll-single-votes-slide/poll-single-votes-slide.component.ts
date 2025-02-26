import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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

@Component({
    selector: `os-motion-poll-single-votes-slide`,
    templateUrl: `./poll-single-votes-slide.component.html`,
    styleUrls: [`./poll-single-votes-slide.component.scss`]
})
export class PollSingleVotesSlideComponent extends PollSlideComponent implements OnDestroy {
    public invalid = false;

    public gridStyle: { [key: string]: any } = {};

    public columnStyle: { [key: string]: any } = {};

    public bufferUp: number;
    public bufferLeft: number;
    public chartRows: number;
    public chartColumns: number;
    public userVotesFormatted: FormattedVotes;

    private _columns = 6;

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

    public override set projector(value: ViewProjector) {
        super.projector = value;
        this.formatUserVotes();
    }

    public override get projector(): ViewProjector {
        return super.projector;
    }

    public constructor(
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
        const visibleHeight =
            this.projector.height -
            TITLE_HEIGHT -
            (this.projector.show_header_footer ? HEADER_FOOTER_HEIGHT : NO_HEADER_TOP_MARGIN);
        const visibleRows = Math.floor(visibleHeight / ENTRY_HEIGHT);
        this.chartRows = Math.min(Math.ceil(visibleRows * ((CHART_AREA_HEIGHT + 10) / visibleHeight)), visibleRows);
        this.bufferUp = Math.floor((visibleRows - this.chartRows) / 2);
        const width = this.projector.width - 100;
        let [chartColumns, bufferLeft, maxVisibleEntries] = this.calculateEntryNumberForColumns(
            this._maxColumns,
            width,
            visibleRows,
            this.chartRows
        );
        if (maxVisibleEntries <= this._userVotes.length) {
            this._columns = this._maxColumns;
        } else {
            for (let columns = this._maxColumns - 1; columns > 0; columns--) {
                const [newChartColumns, newBufferLeft, newMaxVisibleEntries] = this.calculateEntryNumberForColumns(
                    columns,
                    width,
                    visibleRows,
                    this.chartRows
                );
                if (newMaxVisibleEntries <= this._userVotes.length) {
                    this._columns = columns + 1;
                    break;
                }
                [chartColumns, bufferLeft, maxVisibleEntries] = [newChartColumns, newBufferLeft, newMaxVisibleEntries];
            }
        }
        this.chartColumns = chartColumns;
        this.bufferLeft = bufferLeft;
        const overflow = this._userVotes.length - maxVisibleEntries;
        const overflowPerColumn = Math.floor(overflow / this._columns);
        const additionalOverflowColumns = overflow % this._columns;
        console.log(
            `height ${this.projector.height},\nvisibleHeight ${visibleHeight},\nvisibleRows ${visibleRows},\nchartRows ${this.chartRows},\nbufferUp ${this.bufferUp},\nwidth ${width},\nchartColumns ${chartColumns},\nbufferLeft ${bufferLeft},\nmaxVisibleEntries ${maxVisibleEntries},\ncolumns ${this._columns},\noverflow ${overflow},\noverflowPerColumn ${overflowPerColumn},\nadditionalOverflowColumns ${additionalOverflowColumns}`
        );
        const votesFormatted: FormattedVotes = [`top`, `center`, `bottom`].mapToObject(key => ({
            [key]: [`left`, `center`, `right`].mapToObject(innerKey => ({ [innerKey]: [] }))
        }));
        let nextIndex = 0;
        for (let i = 0; i < this._columns; i++) {
            const side: keyof FormattedVotesArea =
                i < this.bufferLeft ? `left` : i >= this.bufferLeft + this.chartColumns ? `right` : `center`;
            let untilIndex = Math.min(nextIndex + this.bufferUp, this._userVotes.length);
            votesFormatted.top[side].push(this._userVotes.slice(nextIndex, untilIndex));
            nextIndex = untilIndex;
            if (i < this.bufferLeft || i >= this.bufferLeft + this.chartColumns) {
                untilIndex = Math.min(nextIndex + this.chartRows, this._userVotes.length);
                votesFormatted.center[side].push(this._userVotes.slice(nextIndex, untilIndex));
                nextIndex = untilIndex;
            }
            untilIndex =
                nextIndex +
                visibleRows -
                this.bufferUp -
                this.chartRows +
                overflowPerColumn +
                (i < additionalOverflowColumns ? 1 : 0);
            votesFormatted.bottom[side].push(this._userVotes.slice(nextIndex, untilIndex));
            nextIndex = untilIndex;
        }
        let templateColumns = `${this.chartColumns}fr`;
        if (this.bufferLeft) {
            templateColumns = `${this.bufferLeft}fr ${templateColumns} ${this.bufferLeft}fr`;
        }
        this.gridStyle = {
            [`grid-template-columns`]: templateColumns
        };
        this.columnStyle = {
            [`width`]: `${Math.floor(((this.projector?.width ?? 100) - 100) / this._columns - 5)}px`
        };
        this.userVotesFormatted = Object.entries(votesFormatted).mapToObject(
            ([key, area]: [keyof FormattedVotes, FormattedVotesArea]) => {
                if (Object.values(area).some(val => val.length)) {
                    return { [key]: Object.entries(area).mapToObject(([k, v]) => (v.length ? { [k]: v } : {})) };
                }
                return {};
            }
        );
    }

    private calculateEntryNumberForColumns(
        columns: number,
        width: number,
        visibleRows: number,
        chartRows: number
    ): [number, number, number] {
        const spacePerColumn = Math.floor(width / columns);
        let chartColumns = Math.min(Math.ceil((CHART_AREA_WIDTH + 10) / spacePerColumn), columns);
        const bufferLeft = Math.floor((columns - chartColumns) / 2);
        chartColumns = columns - bufferLeft * 2;
        const maxVisibleEntries = chartColumns * (visibleRows - chartRows) + (columns - chartColumns) * visibleRows;
        return [chartColumns, bufferLeft, maxVisibleEntries];
    }
}
