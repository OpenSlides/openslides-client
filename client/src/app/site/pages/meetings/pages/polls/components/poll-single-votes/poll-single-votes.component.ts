import { KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource, toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { PollState } from 'src/app/domain/models/poll';
import { KeyedTranslations } from 'src/app/domain/translations';
import { BaseComponent } from 'src/app/site/base/base.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';
import { PipesModule } from 'src/app/ui/pipes';

import { BaseVoteData } from '../../../../modules/poll/base/base-poll-detail.component';
import { VotesFilterService } from '../../../../modules/poll/services/votes-filter.service';
import { VotingService } from '../../../../modules/poll/services/voting.service';
import { ViewPoll, ViewPollBallot, ViewPollConfigApproval, ViewPollOption } from '../../../../pages/polls';

@Component({
    selector: `os-poll-single-votes`,
    templateUrl: `./poll-single-votes.component.html`,
    styleUrls: [`./poll-single-votes.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IconContainerComponent,
        TranslatePipe,
        DirectivesModule,
        ListModule,
        HeadBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        MatCardModule,
        MatTooltipModule,
        MatIconModule,
        MatTabsModule,
        PipesModule,
        KeyValuePipe
    ]
})
export class PollSingleVotesComponent extends BaseComponent {
    public poll = input.required<ViewPoll>();

    public getDetailLink = computed(() => {
        return `/${this.poll().getDetailStateUrl()}`;
    });

    public filterProps = [`user.getFullName`];

    public selectedTab = signal(0);

    public votesData$: Observable<BaseVoteData[]> = toObservable(this.poll).pipe(
        switchMap(poll => (poll.state === PollState.Finished ? poll.ballots$ : of([]))),
        map((ballots: ViewPollBallot[]) =>
            ballots.map(ballot => {
                const user = ballot.represented_meeting_user?.user;
                return {
                    delegation:
                        ballot.acting_meeting_user_id !== ballot.represented_meeting_user_id
                            ? ballot.acting_meeting_user
                            : null,
                    user: user,
                    id: user?.id,
                    weight: +ballot.weight !== 1 ? +ballot.weight : undefined,
                    value: this.parseVoteValue(ballot.value),
                    valueRaw: JSON.parse(ballot.value)
                };
            })
        ),
        tap(ballots => (this.totalCount = ballots.length))
    );

    public totalCount = 0;

    public votingService = inject(VotingService);
    public filter = inject(VotesFilterService);

    public optionMap = rxResource<Record<Id, ViewPollOption>, { poll: ViewPoll }>({
        params: () => ({ poll: this.poll() }),
        defaultValue: {},
        stream: ({ params }) =>
            params.poll.options$.pipe(
                map(options => {
                    const optionMap: Record<Id, ViewPollOption> = {};
                    for (const option of options) {
                        optionMap[option.id] = option;
                    }

                    return optionMap;
                })
            )
    });

    public isMultiVote(vote: string | Record<number, string>): boolean {
        return vote && typeof vote !== `string`;
    }

    public isGeneralAbstain(vote: unknown): boolean {
        return Array.isArray(vote) && !vote.length;
    }

    private parseVoteValue(value: string): string | Record<number, string> {
        const parsed = JSON.parse(value);

        if (this.poll().config instanceof ViewPollConfigApproval) {
            return this.translate.instant(KeyedTranslations[`poll_option.${parsed}`]);
        }

        if (Array.isArray(parsed)) {
            return parsed.reduce((map, obj) => {
                map[obj] = ``;
                return map;
            }, {});
        }

        return parsed;
    }
}
