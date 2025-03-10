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
const ENTRY_HEIGHT = 30;
const TITLE_HEIGHT = 55;
const POLL_BAR_HEIGHT = 91;
const HEADER_FOOTER_HEIGHT = 125;
const NO_HEADER_TOP_MARGIN = 40;

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
    public userVotesFormatted: [string, VoteResult][][];

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
        const [columns, rows] = this.newGetUserVotesFormat();
        this.newCalculateFormattedUserVotes(columns, rows);
        `1fr `.repeat(columns).trim();
        this.gridStyle = {
            [`grid-template-columns`]: `1fr `.repeat(columns).trim()
        };
        this.columnStyle = {
            [`width`]: `${Math.floor(((this.projector?.width ?? 100) - 100) / columns - 5)}px`
        };
        this.cd.markForCheck();
    }

    private newGetUserVotesFormat(): [number, number] {
        const visibleHeight =
            this.projector.height -
            TITLE_HEIGHT -
            POLL_BAR_HEIGHT -
            (this.projector.show_header_footer ? HEADER_FOOTER_HEIGHT : NO_HEADER_TOP_MARGIN);
        const visibleRows = Math.floor(visibleHeight / ENTRY_HEIGHT);
        const columns = Math.min(Math.ceil(this._userVotes.length / visibleRows), this._maxColumns);
        return [columns, Math.max(visibleRows, Math.ceil(this._userVotes.length / columns))];
    }

    private newCalculateFormattedUserVotes(columns: number, rows: number): void {
        let nextIndex = 0;
        const votesFormatted: [string, VoteResult][][] = [];
        for (let i = 0; i < columns; i++) {
            const [stop, untilIndex] = this.newCalcStopAndActualUntilIndex(nextIndex + rows);
            votesFormatted.push(this._userVotes.slice(nextIndex, untilIndex));
            if (stop) break;
            nextIndex = untilIndex;
        }
        this.userVotesFormatted = votesFormatted;
    }

    private newCalcStopAndActualUntilIndex(untilIndex: number): [boolean, number] {
        return [untilIndex >= this._userVotes.length, Math.min(untilIndex, this._userVotes.length)];
    }
}
