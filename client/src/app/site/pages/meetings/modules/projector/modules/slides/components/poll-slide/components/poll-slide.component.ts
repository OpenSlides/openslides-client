import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { of, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { OptionData, OptionTitle, PollData } from 'src/app/domain/models/poll/generic-poll';
import { PollClassType, PollState } from 'src/app/domain/models/poll/poll-constants';
import { Projector } from 'src/app/domain/models/projector/projector';
import { User } from 'src/app/domain/models/users/user';
import { collectionFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { UnknownUserLabel } from 'src/app/site/pages/meetings/pages/assignments/modules/assignment-poll/services/assignment-poll.service';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';

import { BaseScaleScrollSlideComponent } from '../../../base/base-scale-scroll-slide-component';
import { BaseSlideComponent } from '../../../base/base-slide-component';
import { modifyAgendaItemNumber } from '../../../definitions';
import {
    PollSlideData,
    PollSlideDataFields,
    PollSlideEntitledUsersEntry,
    PollSlideLiveEntitledStructureLevels,
    PollSlideLiveEntitledUsers,
    SlidePollOption,
    SlidePollOptionFields,
    SlidePollUser,
    SlidePollVote
} from '../poll-slide-data';

export enum PollContentObjectType {
    Standalone = `standalone`,
    Motion = `motion`,
    Assignment = `assignment`,
    Topic = `topic`
}

type VoteResult = `Y` | `N` | `A` | `X`;
const ENTRY_HEIGHT = 30;
const TITLE_HEIGHT = 55;
const PROGRESS_HEIGHT = 22;
const POLL_BAR_HEIGHT = 91;
const HEADER_FOOTER_HEIGHT = 125;
const NO_HEADER_TOP_MARGIN = 40;

@Component({
    selector: `os-poll-slide`,
    templateUrl: `./poll-slide.component.html`,
    styleUrls: [`./poll-slide.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PollSlideComponent
    extends BaseSlideComponent<PollSlideData>
    implements BaseScaleScrollSlideComponent<PollSlideData>, OnDestroy
{
    public PollState = PollState;
    public PollContentObjectType = PollContentObjectType;

    public pollContentObjectType: PollContentObjectType | null = null;

    public title!: string;

    public polldata!: PollData;

    public results = {
        Y: 0,
        N: 0,
        A: 0,
        valid: 0
    };

    public get showContent(): boolean {
        return (
            this.data.data.state === PollState.Published ||
            (this.isLiveVote &&
                (this.data.data.state === PollState.Created || this.data.data.state === PollState.Started))
        );
    }

    public get showResult(): boolean {
        return !this.isLiveVote || (this.isLiveVote && this.data.data.state === PollState.Published);
    }

    public get isRunningLiveVote(): boolean {
        return this.isLiveVote && this.data.data.state === PollState.Started;
    }

    public get isLiveVote(): boolean {
        return this.data.data.live_voting_enabled;
    }

    public get numEntitledUsers(): number {
        if (this._entitledLiveUsers !== null) {
            return Object.keys(this._entitledLiveUsers).length;
        }

        return Object.keys(this._entitledUsers).length;
    }

    public override get projector(): ViewProjector {
        return super.projector;
    }

    public override set projector(value: ViewProjector) {
        const old = super.projector;
        const isInit = !old !== !value;
        super.projector = value;
        if (
            isInit ||
            [`width`, `height`, `show_header_footer`].some((key: keyof Projector) => value[key] !== old[key])
        ) {
            this.onProjectorFormatChange(value);
        }
    }

    public titleDivStyles: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'margin-top'?: string;
    } = { [`margin-top`]: `50px` };

    public textDivStyles: {
        width?: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'margin-top'?: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'transform-origin'?: string;
        transform?: string;
    } = { [`transform-origin`]: `0 0` };

    private _scroll = 0;

    @Input()
    public set scroll(scroll: number) {
        this._scroll = scroll ?? 0;
        scroll *= -25;
        this.textDivStyles[`margin-top`] = `${scroll}px`;
        this.cd.markForCheck();
    }

    public get scroll(): number {
        return this._scroll;
    }

    protected _actualScale = 1;
    private _scale = 0;

    @Input()
    public set scale(scale: number) {
        this._scale = scale ?? 0;
        this._actualScale = 1.05 ** this._scale;
        this.textDivStyles[`transform`] = `scale(${this._actualScale})`;
        this.textDivStyles[`width`] = `calc(100% / ${this._actualScale})`;
        this.formatUserVotes();
    }

    public get scale(): number {
        return this._scale;
    }

    // SINGLE VOTES

    public get useSingleVotes(): boolean {
        return (
            this._isSingleVotes &&
            !this._invalidSingleVotesData &&
            this.pollContentObjectType === PollContentObjectType.Motion &&
            !this.data.data.is_pseudoanonymized
        );
    }

    private _isSingleVotes = false;

    private _invalidSingleVotesData = false;

    public gridStyle: Record<string, any> = {};

    public columnStyle: Record<string, any> = {};

    public bufferUp: number;
    public userVotesFormatted: ([number, number, number, string] | [string, VoteResult] | string)[][];

    private _maxColumns = 6;
    private _orderBy: keyof User = `last_name`;
    private _userVotes: ([number, number, number, string] | [string, VoteResult] | string)[] = [];

    private _votes: Record<string, SlidePollVote> = {};

    private _entitledUsers: Record<string, PollSlideEntitledUsersEntry> = {};
    private _entitledLiveUsers: PollSlideLiveEntitledUsers = null;
    private _structureLevels: PollSlideLiveEntitledStructureLevels = {};

    private _meetingSettingsSubscriptions: Subscription[];

    public constructor(
        private collectionMapperService: CollectionMapperService,
        private cd: ChangeDetectorRef,
        private meetingSettings: MeetingSettingsService
    ) {
        super();
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

    protected onProjectorFormatChange(projector: ViewProjector): void {
        if (projector.show_header_footer) {
            this.titleDivStyles[`margin-top`] = `50px`;
        } else {
            this.titleDivStyles[`margin-top`] = `0`;
        }
        this.formatUserVotes();
    }

    protected override setData(value: SlideData<PollSlideData>): void {
        const poll = value.data;
        if (value.options[`single_votes`] == true && poll && poll.options.length === 1) {
            this._isSingleVotes = true;
            this._votes =
                poll.options[0].votes?.mapToObject(vote => ({
                    [vote.user_id]: vote
                })) || {};
            this._entitledUsers =
                value.data.entitled_users_at_stop?.mapToObject(user => ({
                    [user.user_merged_into_id ?? user.user_id]: user
                })) || {};
            this._entitledLiveUsers = value.data.entitled_users ?? null;
            this._structureLevels = value.data.entitled_structure_levels ?? {};
            this.calculateUserVotes();
            this._invalidSingleVotesData = false;
        } else {
            this._isSingleVotes = false;
            this._invalidSingleVotesData = true;
        }

        super.setData(value);

        // Convert every decimal(string) to a float
        PollSlideDataFields.forEach((field: keyof PollSlideData) => {
            if (value.data[field] !== undefined) {
                (value.data[field] as any) = parseFloat(value.data[field] as any);
            }
        });
        if (value.data.global_option) {
            SlidePollOptionFields.forEach((field: keyof SlidePollOption) => {
                if (value.data.global_option[field] !== undefined) {
                    (value.data.global_option[field] as any) = parseFloat(value.data.global_option[field] as any);
                }
            });
        }
        value.data.options.forEach(option => {
            SlidePollOptionFields.forEach((field: keyof SlidePollOption) => {
                if (option[field] !== undefined) {
                    (option[field] as any) = parseFloat(option[field] as any);
                }
            });
        });

        if (this.showContent) {
            this.polldata = this.createPollData(value.data);
        }

        if (value.data.content_object_id) {
            this.pollContentObjectType = collectionFromFqid(value.data.content_object_id) as PollContentObjectType;
        } else {
            this.pollContentObjectType = PollContentObjectType.Standalone;
        }

        this.title = value.data.title;
        this.cd.markForCheck();
    }

    private createPollData(data: PollSlideData): PollData {
        const getContentObjectTitle = (): string => {
            if (data.title_information) {
                modifyAgendaItemNumber(data.title_information);
                const repo = this.collectionMapperService.getRepository(data.title_information.collection);
                return repo!.getTitle(data.title_information as any);
            } else {
                return null;
            }
        };
        const options = data.options.map((option, i) => this.createOptionData(option, i + 1));
        const poll: PollData = {
            getContentObjectTitle,
            pollmethod: data.pollmethod,
            pollClassType: collectionFromFqid(data.content_object_id) as PollClassType,
            state: data.state,
            onehundred_percent_base: data.onehundred_percent_base,
            votesvalid: data.votesvalid,
            votesinvalid: data.votesinvalid,
            votescast: data.votescast,
            type: data.type,
            entitled_users_at_stop: data.entitled_users_at_stop,
            options,
            options$: of(options),
            global_option: data.global_option
                ? this.createOptionData(data.global_option)
                : ({ getOptionTitle: () => ({ title: `` }) } as OptionData)
        };
        return poll;
    }

    private createOptionData(data: SlidePollOption, weight = 1): OptionData {
        const getOptionTitle: () => OptionTitle = () => {
            if (data.text) {
                return { title: data.text };
            } else if (data.content_object && data.content_object.collection === `user`) {
                return { title: (data.content_object as any).username };
            } else if (data.content_object) {
                modifyAgendaItemNumber(data.content_object!);
                const repo = this.collectionMapperService.getRepository(data.content_object!.collection);
                return { title: repo!.getTitle(data.content_object as any) };
            } else {
                return this.pollContentObjectType === PollContentObjectType.Assignment
                    ? { title: UnknownUserLabel, subtitle: `` }
                    : { title: _(`No data`) };
            }
        };
        return {
            getOptionTitle,
            yes: data.yes,
            no: data.no,
            abstain: data.abstain,
            weight,
            ...(data.content_object ? { entries_amount: data.content_object[`entries_amount`] } : {})
        };
    }

    private calculateUserVotes(): void {
        if (this._isSingleVotes) {
            if (this._entitledUsers && this._entitledLiveUsers === null) {
                this.setUserVotesAndUpdate(
                    this._entitledUsers,
                    a => a.user,
                    val => {
                        const notVotedVal = val[1].present ? `X` : `x`;
                        return this._votes[val[0]] ? this._votes[val[0]].value : notVotedVal;
                    }
                );
            } else if (this._entitledLiveUsers !== null) {
                this.setUserVotesAndUpdate(
                    this._entitledLiveUsers,
                    a => a.user_data,
                    val => {
                        const notVotedVal = val[1].present ? `X` : `x`;
                        return val[1].votes ? (Object.values(val[1].votes)[0] as string) : notVotedVal;
                    }
                );
            }
        }
    }

    private setUserVotesAndUpdate<C extends { present?: boolean; structure_level_id?: Id }>(
        entitled_users: Record<string, C>,
        getUserData: (a: C) => SlidePollUser,
        getVoteString: (val: [string, C]) => string
    ): void {
        const users = Object.entries(entitled_users);
        const splitUsers: Record<number, [string, C][]> = {};
        for (const entry of users) {
            const str_lvl_id = entry[1].structure_level_id ?? 0;
            if (!(str_lvl_id in splitUsers)) {
                splitUsers[str_lvl_id] = [];
            }
            splitUsers[str_lvl_id].push(entry);
        }
        const splitUserVotes = Object.entries(splitUsers).mapToObject<[string, VoteResult][]>(date => ({
            [date[0]]: date[1]
                .map(val => {
                    const username = this.getNameAndSortValue(getUserData(val[1]), this._orderBy) || [
                        `User`,
                        `${val[0]}`
                    ];

                    return [...username, getVoteString(val)];
                })
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([user, _, vote]) => [user, vote as VoteResult])
        }));
        this._userVotes = Object.entries(splitUserVotes).flatMap(str_lvl_list => {
            const str_lvl = Number(str_lvl_list[0]);
            if (str_lvl > 0) {
                let yes = 0;
                let no = 0;
                let abstain = 0;
                for (const res of str_lvl_list[1]) {
                    if (res[1] === `Y`) {
                        yes += 1;
                    } else if (res[1] === `N`) {
                        no += 1;
                    } else if (res[1] === `A`) {
                        abstain += 1;
                    }
                }
                const str_level_w_number: [number, number, number, string] = [
                    yes,
                    no,
                    abstain,
                    this._structureLevels[str_lvl]
                ];
                return [str_level_w_number, ...str_lvl_list[1]];
            }
            return str_lvl_list[1];
        });
        this.updateResults();
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

    private updateResults(): void {
        this.results = {
            Y: this._userVotes.filter(e => typeof e !== `string` && e[1] === `Y`).length,
            N: this._userVotes.filter(e => typeof e !== `string` && e[1] === `N`).length,
            A: this._userVotes.filter(e => typeof e !== `string` && e[1] === `A`).length,
            valid: this._userVotes.filter(
                e => typeof e !== `string` && typeof e[1] !== `number` && e[1].toUpperCase() !== `X`
            ).length
        };
    }

    private formatUserVotes(): void {
        if (!this.projector || !this._userVotes || !this._isSingleVotes) {
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
        let visibleHeight =
            (this.projector.height -
                TITLE_HEIGHT -
                POLL_BAR_HEIGHT -
                (this.projector.show_header_footer ? HEADER_FOOTER_HEIGHT : NO_HEADER_TOP_MARGIN)) /
            this._actualScale;
        if (this.isRunningLiveVote) {
            visibleHeight -= PROGRESS_HEIGHT;
        }
        const visibleRows = Math.floor(visibleHeight / ENTRY_HEIGHT);
        const columns = Math.min(Math.ceil(this._userVotes.length / visibleRows), this._maxColumns);
        return [columns, Math.max(visibleRows, Math.ceil(this._userVotes.length / columns))];
    }

    private newCalculateFormattedUserVotes(columns: number, rows: number): void {
        let nextIndex = 0;
        const votesFormatted: ([number, number, number, string] | [string, VoteResult] | string)[][] = [];
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
