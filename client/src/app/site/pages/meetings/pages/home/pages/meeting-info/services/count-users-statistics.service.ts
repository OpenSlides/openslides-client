import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/gateways/http.service';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { AUTOUPDATE_DEFAULT_ENDPOINT } from 'src/app/site/services/autoupdate';

/**
 * The format of the count statistic
 */
export interface CountUserStatistics {
    activeUserHandles: number;
    activeUsers: Record<number, number>;
    groups: Record<
        number,
        {
            name: string;
            users: Record<number, number>;
            userHandleCount: number;
            meeting_id?: number;
        }
    >;
}

const CONNECTION_COUNT_PATH = `/system/${AUTOUPDATE_DEFAULT_ENDPOINT}/connection_count`;

@Injectable({
    providedIn: `root`
})
export class CountUsersStatisticsService {
    public get lastUpdated(): number {
        return this._lastUpdated;
    }

    private _lastUpdated: number;

    public constructor(
        private http: HttpService,
        private userRepo: UserRepositoryService
    ) {}

    /**
     * Starts counting users.
     *
     * @returns a 2-tuple of count user statistics
     */
    public async countUsers(): Promise<CountUserStatistics[]> {
        const raw = await this.http.get<Record<number, Record<string, number>>>(CONNECTION_COUNT_PATH);
        this._lastUpdated = Date.now();
        const result: CountUserStatistics[] = [];
        raw[2] = {};
        for (let i = 0; i < 2; i++) {
            for (const id of Object.keys(raw[i])) {
                raw[2][id] = raw[2][id] || 0;
                raw[2][id] += raw[i][id];
            }
        }

        for (let i = 0; i < 3; i++) {
            const entries = Object.entries(raw[i]).filter(
                entry => entry[1] > 0 && this.userRepo.getViewModel(+entry[0])?.getMeetingUser()
            );
            const users = Object.fromEntries(entries);
            result[i] = {
                activeUserHandles: entries
                    .map(entry => entry[1])
                    .reduce((previousValue, currentValue) => (previousValue ?? 0) + currentValue, 0),
                activeUsers: users,
                groups: {}
            };
            entries.forEach(entry => {
                const userId = entry[0] ? +entry[0] : 0;

                const user = this.userRepo.getViewModel(userId);

                // Add to group stats
                const groups = user ? user.groups() : [];
                groups.forEach(group => {
                    if (!result[i].groups[group.id]) {
                        result[i].groups[group.id] = {
                            name: group.name,
                            users: {},
                            userHandleCount: 0,
                            meeting_id: group.meeting_id
                        };
                    }
                    result[i].groups[group.id].userHandleCount += entry[1];
                    result[i].groups[group.id].users[userId] = result[i].activeUsers[userId];
                });
            });
        }

        return result;
    }
}
