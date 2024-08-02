import { Component } from '@angular/core';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { CountUsersStatisticsService, CountUserStatistics } from '../../services/count-users-statistics.service';

enum DISPLAY_MODES {
    SSE = 0,
    LONGPOLLING = 1,
    BOTH = 2
}

@Component({
    selector: `os-count-users`,
    templateUrl: `./count-users.component.html`,
    styleUrls: [`./count-users.component.scss`]
})
export class CountUsersComponent extends BaseUiComponent {
    public stats: CountUserStatistics[] | null = null;
    public displayMode: DISPLAY_MODES = DISPLAY_MODES.BOTH;

    public get lastUpdated(): number {
        return this.countUsersStatisticService.lastUpdated;
    }

    public get activeUserHandles(): number {
        return this.stats ? this.stats[this.displayMode].activeUserHandles : 0;
    }

    public get selectedStats(): CountUserStatistics {
        return this.stats ? this.stats[this.displayMode] : null;
    }

    public constructor(private countUsersStatisticService: CountUsersStatisticsService) {
        super();
    }

    public async countUsers(): Promise<void> {
        this.stats = await this.countUsersStatisticService.countUsers();
    }

    public userIds(): number[] {
        return this.stats ? Object.keys(this.stats[this.displayMode].activeUsers).map(id => +id) : [];
    }

    public groupIds(): number[] {
        return this.stats ? Object.keys(this.stats[this.displayMode].groups).map(id => +id) : [];
    }

    public userInGroupIds(groupId: number): number[] {
        return this.stats ? Object.keys(this.stats[this.displayMode].groups[groupId].users).map(id => +id) : [];
    }
}
