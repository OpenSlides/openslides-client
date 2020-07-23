import { Injectable } from '@angular/core';

import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { Meeting } from 'app/shared/models/event-management/meeting';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorWithoutActiveMeetingService } from '../repository-service-collector-without-active-meeting-service';

@Injectable({
    providedIn: 'root'
})
export class MeetingRepositoryService extends BaseRepository<ViewMeeting, Meeting> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollectorWithoutActiveMeetingService,
        private meetingSettingsService: MeetingSettingsService
    ) {
        super(repositoryServiceCollector, Meeting);
    }

    public getFieldsets(): Fieldsets<Meeting> {
        return {
            [DEFAULT_FIELDSET]: ['description'],
            settings: this.meetingSettingsService.getSettingsKeys()
        };
    }

    public getTitle = (viewMeeting: ViewMeeting) => {
        return viewMeeting.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Meetings' : 'Meeting');
    };
}
