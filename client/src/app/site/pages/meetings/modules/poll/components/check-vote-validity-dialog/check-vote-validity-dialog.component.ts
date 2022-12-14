import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VoteValuesVerbose } from 'src/app/domain/models/poll';

import { ViewPoll } from '../../../../pages/polls';

type OptionValueType = `Y` | `N` | `A` | number;

interface PersonalVotes {
    [key: string]: OptionValueType;
}

interface RawVotes {
    id: string;
    votes: {
        votes: PersonalVotes;
        token: string;
    }[];
}

@Component({
    selector: `os-check-vote-validity-dialog`,
    templateUrl: `./check-vote-validity-dialog.component.html`,
    styleUrls: [`./check-vote-validity-dialog.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckVoteValidityDialogComponent implements OnInit {
    public verboseYNA = VoteValuesVerbose;

    public get poll(): ViewPoll {
        return this.data?.data as ViewPoll;
    }

    private get rawVotes(): RawVotes {
        return JSON.parse(this.poll?.votes_raw) as RawVotes;
    }

    public get hasData(): boolean {
        return !!this.poll?.votes_raw;
    }

    public token = new FormControl(``);
    public selectToken = new FormControl(``);

    public votes: PersonalVotes[] = [];

    public get optionTitles(): { [key: string]: string } {
        return this.poll.options.mapToObject(option => {
            return { [option.id]: option.getOptionTitle().title };
        });
    }

    public get showOptionName() {
        return !this.poll.isMotionPoll;
    }

    constructor(@Inject(MAT_DIALOG_DATA) private data: any) {}

    public ngOnInit(): void {
        this.token.valueChanges.subscribe(token => this.handleTokenUpdate(token));
    }

    public shouldDisplayIconForValue(value: OptionValueType): boolean {
        return ([`Y`, `N`, `A`] as any[]).includes(value);
    }

    private handleTokenUpdate(newToken: string): void {
        this.votes = this.rawVotes?.votes?.filter(vote => vote?.token === newToken).map(vote => vote?.votes) ?? [];
    }
}
