import { Component } from '@angular/core';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { CountUsersStatisticsService, CountUserStatistics } from '../../services/count-users-statistics.service';

@Component({
    selector: `os-count-users`,
    templateUrl: `./count-users.component.html`,
    styleUrls: [`./count-users.component.scss`]
})
export class CountUsersComponent extends BaseUiComponent {
    public stats: CountUserStatistics | null = null;

    public get lastUpdated(): number {
        return this.countUsersStatisticService.lastUpdated;
    }

    public constructor(private countUsersStatisticService: CountUsersStatisticsService) {
        super();
    }

    public async countUsers(): Promise<void> {
        this.stats = await this.countUsersStatisticService.countUsers();
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
}
