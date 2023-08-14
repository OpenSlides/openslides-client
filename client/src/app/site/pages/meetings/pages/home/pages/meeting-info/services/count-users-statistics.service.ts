import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/gateways/http.service';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { AUTOUPDATE_DEFAULT_ENDPOINT } from 'src/app/site/services/autoupdate';

/**
 * The format of the count statistic
 */
export interface CountUserStatistics {
    activeUserHandles: number;
    activeUsers: {
        [id: number]: number;
    };
    groups: {
        [id: number]: {
            name: string;
            users: {
                [id: number]: number;
            };
            userHandleCount: number;
            meeting_id?: number;
        };
    };
}

export const DEFAULT_COUNT_USERS_OBJECT: CountUserStatistics = {
    activeUserHandles: 0,
    activeUsers: {},
    groups: {}
};

const CONNECTION_COUNT_PATH = `/system/${AUTOUPDATE_DEFAULT_ENDPOINT}/connection_count`;

@Injectable({
    providedIn: `root`
})
export class CountUsersStatisticsService {
    public get lastUpdated(): number {
        return this._lastUpdated;
    }

    private currentCount: CountUserStatistics;
    private _lastUpdated: number;

    public constructor(private http: HttpService, private userRepo: UserRepositoryService) {}

    /**
     * Starts counting users.
     *
     * @returns a 2-tuple: A token to stop the counting with `stopCounting` and
     * an observable where the statistics are published.
     */
    public async countUsers(): Promise<CountUserStatistics> {
        const raw = await this.http.get<{ [key: string]: number }>(CONNECTION_COUNT_PATH);
        this._lastUpdated = Date.now();
        const entries = Object.entries(raw).filter(
            entry => entry[1] > 0 && this.userRepo.getViewModel(+entry[0]).getMeetingUser()
        );
        const users = Object.fromEntries(entries);
        let result = {
            activeUserHandles: entries
                .map(entry => entry[1])
                .reduce((previousValue, currentValue) => (previousValue ?? 0) + currentValue),
            activeUsers: users,
            groups: {}
        };
        entries.forEach(entry => {
            const userId = !!entry[0] ? +entry[0] : 0;

            const user = this.userRepo.getViewModel(userId);

            // Add to group stats
            const groups = user ? user.groups() : [];
            groups.forEach(group => {
                if (!result.groups[group.id]) {
                    result.groups[group.id] = {
                        name: group.name,
                        users: {},
                        userHandleCount: 0,
                        meeting_id: group.meeting_id
                    };
                }
                result.groups[group.id].userHandleCount += entry[1];
                result.groups[group.id].users[userId] = result.activeUsers[userId];
            });
        });

        this.currentCount = result;
        return this.currentCount;
    }
}
