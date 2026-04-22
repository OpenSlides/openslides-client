import { Injectable } from '@angular/core';
import { TZDate } from '@date-fns/tz';
import { Id } from 'src/app/domain/definitions/key-types';
import { Selectable } from 'src/app/domain/interfaces';
import { GetValidTimezonesPresenterService } from 'src/app/gateways/presenter/get-valid-timezones';

import { ActiveMeetingService } from '../pages/meetings/services/active-meeting.service';
import { ORGANIZATION_ID } from '../pages/organization/services/organization.service';
import { OrganizationControllerService } from '../pages/organization/services/organization-controller.service';

class SearchSelectorHelper implements Selectable {
    public value: string;
    public id: number;

    public constructor(value, id) {
        this.value = value;
        this.id = id;
    }

    public getTitle(): string {
        return this.value;
    }

    public getListTitle(): string {
        return this.getTitle();
    }
}

@Injectable({
    providedIn: `root`
})
export class TimeZoneService {
    public constructor(
        private activeMeetingRepo: ActiveMeetingService,
        private organizationRepo: OrganizationControllerService,
        private presenter: GetValidTimezonesPresenterService
    ) {}

    private timezonesCache: Selectable[] | null = null;

    public async getAvailableTimeZones(): Promise<string[]> {
        const timezones = await this.presenter.call();
        return Intl.supportedValuesOf('timeZone').filter(value => !value.startsWith(`Etc`) && timezones[value]);
    }

    public async getTZForSearchSelector(): Promise<Selectable[]> {
        if (this.timezonesCache) {
            return this.timezonesCache;
        }
        const timezones = await this.getAvailableTimeZones();
        let i = 0;
        this.timezonesCache = timezones.map(value => {
            i++;
            return new SearchSelectorHelper(value, i);
        });
        return this.timezonesCache;
    }

    public transformFromDate(value: Date, tz?: string): Date {
        if (!value) {
            return value;
        }
        const year = value.getFullYear();
        const month = value.getMonth();
        const day = value.getDate();
        const timezone = tz ?? this.getActiveMeetingTZ();
        return new TZDate(year, month, day, timezone);
    }

    public transformFromTS(value: number, tz?: string): Date {
        const timezone = tz ?? this.getActiveMeetingTZ();
        return new TZDate(value * 1000, timezone);
    }

    public getOrganizationTimeZone(): string {
        return this.organizationRepo.getViewModel(ORGANIZATION_ID)?.time_zone ?? 'UTC';
    }

    public getActiveMeetingTZ(): string {
        return this.activeMeetingRepo.meeting?.time_zone ?? this.getOrganizationTimeZone();
    }

    public getTimezoneIdByName(name: string): Id {
        return this.timezonesCache?.find(item => item.getTitle() === name)?.id;
    }

    public getTimezoneNameById(id: Id): string {
        return this.timezonesCache?.find(item => item.id === id)?.getTitle();
    }
}
