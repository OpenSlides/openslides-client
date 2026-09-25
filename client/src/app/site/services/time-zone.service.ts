import { inject, Service } from '@angular/core';
import { TZDate } from '@date-fns/tz';

import { ActiveMeetingService } from '../pages/meetings/services/active-meeting.service';
import { ORGANIZATION_ID } from '../pages/organization/services/organization.service';
import { OrganizationControllerService } from '../pages/organization/services/organization-controller.service';

@Service()
export class TimeZoneService {
    private activeMeetingRepo = inject(ActiveMeetingService);
    private organizationRepo = inject(OrganizationControllerService);

    public getAvailableTimeZones(): string[] {
        return Intl.supportedValuesOf('timeZone').filter(value => !value.startsWith(`Etc`));
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
}
