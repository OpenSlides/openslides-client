import { Directive, inject } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { PROJECTIONDEFAULT } from 'src/app/domain/models/projector/projection-default';
import { MeetingProjectionType } from 'src/app/gateways/repositories/meeting-repository.service';
import { BaseComponent } from 'src/app/site/base/base.component';

import { ActiveMeetingService } from '../services/active-meeting.service';
import { ActiveMeetingIdService } from '../services/active-meeting-id.service';
import { MeetingComponentServiceCollectorService } from '../services/meeting-component-service-collector.service';
import { MeetingSettingsService } from '../services/meeting-settings.service';
import { ProjectionBuildDescriptor } from '../view-models';
import { ViewMeeting } from '../view-models/view-meeting';

@Directive()
export abstract class BaseMeetingComponent extends BaseComponent {
    public get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    protected get activeMeeting(): ViewMeeting | null {
        return this.activeMeetingService.meeting;
    }

    /**
     * @deprecated Typo: use `meetingSettingsService` instead
     */
    protected get meetingSettingService(): MeetingSettingsService {
        return this.componentServiceCollector.meetingSettingsService;
    }

    protected get meetingSettingsService(): MeetingSettingsService {
        return this.componentServiceCollector.meetingSettingsService;
    }

    protected get activeMeetingIdService(): ActiveMeetingIdService {
        return this.componentServiceCollector.activeMeetingIdService;
    }

    protected get activeMeetingService(): ActiveMeetingService {
        return this.componentServiceCollector.activeMeetingService;
    }

    public override componentServiceCollector = inject(MeetingComponentServiceCollectorService);

    public getAllStructureLevel(): ProjectionBuildDescriptor {
        return {
            content_object_id: `meeting/${this.activeMeetingId}`,
            type: MeetingProjectionType.CurrentStructureLevelList,
            projectionDefault: PROJECTIONDEFAULT.currentListOfSpeakers,
            getDialogTitle: () => this.translate.instant(`All structure levels`)
        };
    }

    public getCurrentStructureLevel(): ProjectionBuildDescriptor {
        return {
            content_object_id: `meeting/${this.activeMeetingId}`,
            type: MeetingProjectionType.CurrentSpeakingStructureLevel,
            stable: true,
            projectionDefault: PROJECTIONDEFAULT.currentListOfSpeakers,
            getDialogTitle: () => this.translate.instant(`Current speaker`)
        };
    }
}
