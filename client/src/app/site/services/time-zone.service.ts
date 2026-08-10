import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Selectable } from '@app/domain/interfaces';
import { GetValidTimezonesPresenterService } from '@app/gateways/presenter/get-valid-timezones';
import { TZDate } from '@date-fns/tz';

import { ActiveMeetingService } from '../pages/meetings/services/active-meeting.service';
import { ORGANIZATION_ID } from '../pages/organization/services/organization.service';
import { OrganizationControllerService } from '../pages/organization/services/organization-controller.service';

class SearchSelectorHelper implements Selectable {
    public value: string;
    public id: number;

    public constructor(value: string, id: string) {
        this.value = value;
        this.id = id as any;
    }

    public getTitle(): string {
        return this.value;
    }

    public getListTitle(): string {
        return this.getTitle();
    }
}

@Service()
export class TimeZoneService {
    private activeMeetingRepo = inject(ActiveMeetingService);
    private organizationRepo = inject(OrganizationControllerService);

    private timezonesCache: Selectable[] | null = null;

    public getAvailableTimeZones(): string[] {
        return Intl.supportedValuesOf('timeZone').filter(value => !value.startsWith(`Etc`));
    }

    public getTZForSearchSelector(): Selectable[] {
        if (this.timezonesCache) {
            return this.timezonesCache;
        }
        const timezones = this.getAvailableTimeZones();
        this.timezonesCache = timezones.map(value => {
            return new SearchSelectorHelper(value, value);
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
