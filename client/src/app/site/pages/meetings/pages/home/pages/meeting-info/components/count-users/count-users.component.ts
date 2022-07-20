import { Component, OnDestroy } from '@angular/core';
import { auditTime, Observable } from 'rxjs';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { CountUsersStatisticsService, CountUserStatistics } from '../../services/count-users-statistics.service';

@Component({
    selector: `os-count-users`,
    templateUrl: `./count-users.component.html`,
    styleUrls: [`./count-users.component.scss`]
})
export class CountUsersComponent extends BaseUiComponent implements OnDestroy {
    public token: string | null = null;
    public stats: CountUserStatistics | null = null;

    public constructor(private countUsersStatisticService: CountUsersStatisticsService) {
        super();
    }

    public countUsers(): void {
        if (this.token) {
            return;
        }
        let statsObservable: Observable<CountUserStatistics>;
        [this.token, statsObservable] = this.countUsersStatisticService.countUsers();
        this.subscriptions.push(
            statsObservable.pipe(auditTime(100)).subscribe(stats => {
                this.stats = stats;
            })
        );
    }

    public stopCounting(): void {
        if (this.token) {
            this.countUsersStatisticService.stopCounting(this.token);
            this.token = null;
            this.stats = null;
        }
    }

    public userIds(): number[] {
        return this.stats ? Object.keys(this.stats.activeUsers).map(id => +id) : [];
    }

    public groupIds(): number[] {
        return this.stats ? Object.keys(this.stats.groups).map(id => +id) : [];
    }

    public userInGroupIds(groupId: number): number[] {
        return this.stats ? Object.keys(this.stats.groups[groupId].users).map(id => +id) : [];
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        this.stopCounting();
    }
}
