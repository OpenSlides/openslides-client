import { BaseMeetingRelatedRepository } from 'src/app/gateways/repositories/base-meeting-related-repository';
import { ActiveMeetingService } from '../services/active-meeting.service';
import { ActiveMeetingIdService } from '../services/active-meeting-id.service';
import { MeetingCollectionMapperService } from '../services/meeting-collection-mapper.service';
import { MeetingSettingsService } from '../services/meeting-settings.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { Id } from 'src/app/domain/definitions/key-types';
import { Directive } from '@angular/core';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { BaseController } from 'src/app/site/base/base-controller';

@Directive()
export abstract class BaseMeetingControllerService<V extends BaseViewModel, M extends BaseModel> extends BaseController<
    V,
    M
> {
    protected get activeMeetingService(): ActiveMeetingService {
        return this.controllerServiceCollector.activeMeetingService;
    }

    protected get activeMeeting(): ViewMeeting | null {
        return this.activeMeetingService.meeting;
    }

    protected get activeMeetingIdService(): ActiveMeetingIdService {
        return this.controllerServiceCollector.activeMeetingIdService;
    }

    protected get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    protected get collectionMapperService(): MeetingCollectionMapperService {
        return this.controllerServiceCollector.collectionMapperService;
    }

    protected get meetingSettingsService(): MeetingSettingsService {
        return this.controllerServiceCollector.meetingSettingsService;
    }

    public constructor(
        protected override controllerServiceCollector: MeetingControllerServiceCollectorService,
        baseModelConstructor: ModelConstructor<M>,
        repo: BaseMeetingRelatedRepository<V, M>
    ) {
        super(controllerServiceCollector, baseModelConstructor, repo);
    }
}
