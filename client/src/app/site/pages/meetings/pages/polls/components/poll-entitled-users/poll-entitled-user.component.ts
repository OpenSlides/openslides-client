import { Component, computed, inject, input } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { BaseComponent } from '@app/site/base/base.component';
import { EntitledUsersListFilterService } from '@app/site/pages/meetings/modules/poll/services/entitled-user-filter.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { DirectivesModule } from '@app/ui/directives';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ListModule } from '@app/ui/modules/list';
import { PipesModule } from '@app/ui/pipes';
import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest, map, Observable, startWith, switchMap, tap } from 'rxjs';

import { ViewMeetingUser } from '../../../../view-models/view-meeting-user';

export interface EntitledUserData extends Identifiable {
    meetingUser: ViewMeetingUser;
    isPresent: boolean;
    hasVoted: boolean;
}

@Component({
    selector: `os-poll-entitled-user`,
    templateUrl: `./poll-entitled-user.component.html`,
    styleUrls: [`./poll-entitled-user.component.scss`],
    imports: [
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
        PipesModule
    ]
})
export class PollEntitledUserComponent extends BaseComponent {
    public poll = input.required<ViewPoll>();

    public getDetailLink = computed(() => {
        return `/${this.poll().getDetailStateUrl()}`;
    });

    public filterProps = [`user.getFullName`];

    public entitledUsers$: Observable<EntitledUserData[]> = toObservable(this.poll).pipe(
        switchMap(poll => combineLatest([poll.entitled_users$, poll.ballot_users$.pipe(startWith([]))])),
        map(([users, voted]) => {
            const votedSet = new Set<Id>();
            for (const user of voted) {
                votedSet.add(user.represented_meeting_user_id);
            }

            return users.map(
                eUser =>
                    ({
                        meetingUser: eUser.meeting_user,
                        isPresent: false, // TODO: Implement or remove
                        hasVoted: votedSet.has(eUser.meeting_user_id)
                    }) as EntitledUserData
            );
        }),
        tap(users => (this.totalCount = users.length))
    );

    public totalCount = 0;

    public filter = inject(EntitledUsersListFilterService);
}
