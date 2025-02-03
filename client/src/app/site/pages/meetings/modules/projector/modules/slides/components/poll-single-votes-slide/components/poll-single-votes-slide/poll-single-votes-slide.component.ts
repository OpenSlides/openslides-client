import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { EntitledUsersEntry } from 'src/app/domain/models/poll';
import { User } from 'src/app/domain/models/users/user';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewVote } from 'src/app/site/pages/meetings/pages/polls';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { PollSlideComponent } from '../../../poll-slide/components/poll-slide.component';
import { PollSlideData } from '../../../poll-slide/poll-slide-data';

type VoteResult = `Y` | `N` | `A` | `X`;
const ENTRIES_PER_PAGE = 9;

@Component({
    selector: `os-motion-poll-single-votes-slide`,
    templateUrl: `./poll-single-votes-slide.component.html`,
    styleUrls: [`./poll-single-votes-slide.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollSingleVotesSlideComponent extends PollSlideComponent implements OnDestroy {
    public invalid = false;

    public get userVotes(): [string, VoteResult][][] {
        return this._userVotesFormatted;
    }

    private _columns = 6;

    private _maxColumns = 6;
    private _orderBy: keyof User = `last_name`;
    private _userVotes: [string, VoteResult][] = [];
    private _userVotesFormatted: [string, VoteResult][][] = [];

    private _votes: {
        [key: string]: ViewVote;
    } = {};

    private _entitledUsers: {
        [key: string]: EntitledUsersEntry;
    };

    private _meetingSettingsSubscriptions: Subscription[];

    public constructor(
        private userController: UserControllerService,
        private pollController: PollControllerService,
        private meetingSettings: MeetingSettingsService,
        pollService: PollService,
        collectionMapperService: CollectionMapperService
    ) {
        // TODO: Once the autoupdate is done, remove the controllers and maybe the meetingSettings
        super(pollService, collectionMapperService);
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
        // TODO: Pull all this data out of the autoupdate projections
        const poll = this.pollController.getViewModel(value.data.id);
        console.log(`poll`, value, poll);
        if (poll && poll.options.length === 1) {
            this._votes = poll.options[0].votes.mapToObject(vote => ({
                [vote.user_id]: vote
            }));
            this._entitledUsers = value.data.entitled_users_at_stop.mapToObject(user => ({
                [user.user_merged_into_id ?? user.user_id]: user
            }));
            this.calculateUserVotes();
            this.invalid = false;
        } else {
            this.invalid = true;
        }
        super.setData(value);
    }

    private calculateUserVotes(): void {
        this._userVotes = Array.from(new Set([...Object.keys(this._votes), ...Object.keys(this._entitledUsers)]))
            .map(id => [...this.getNameAndSortValue(+id, this._orderBy), this._votes[id] ? this._votes[id].value : `X`])
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([user, _, vote]) => [user, vote as VoteResult]);
        this.formatUserVotes();
        console.log(`userVotes`, this._userVotes, this._userVotesFormatted);
    }

    private getNameAndSortValue(userId: Id, by: keyof User): [string, string] {
        // TODO: Pull all this data out of the autoupdate projections
        const user = this.userController.getViewModel(+userId);
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
        return [user.username, user.username];
    }

    private formatUserVotes(): void {
        this._columns = Math.min(this._userVotes.length / ENTRIES_PER_PAGE, this._maxColumns);
        const perColumn = Math.floor(this._userVotes.length / this._columns);
        let overflow = this._userVotes.length - perColumn * this._columns;
        let nextIndex = 0;
        const votesFormatted: [string, VoteResult][][] = [];
        for (let i = 0; i < this._columns; i++) {
            const untilIndex = nextIndex + perColumn + (overflow > 0 ? 1 : 0);
            votesFormatted.push(this._userVotes.slice(nextIndex, untilIndex));
            nextIndex = untilIndex;
            overflow--;
        }
        this._userVotesFormatted = votesFormatted;
    }
}
