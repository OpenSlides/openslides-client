import { Directive } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { BaseModel, ModelConstructor } from '@app/domain/models/base/base-model';
import { BaseRepository } from '@app/gateways/repositories/base-repository';
import { BaseController } from '@app/site/base/base-controller';
import { BaseViewModel } from '@app/site/base/base-view-model';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { ViewMeeting } from '@app/site/pages/meetings/view-models/view-meeting';

import { ActiveMeetingService } from '../services/active-meeting.service';
import { ActiveMeetingIdService } from '../services/active-meeting-id.service';
import { MeetingCollectionMapperService } from '../services/meeting-collection-mapper.service';
import { MeetingSettingsService } from '../services/meeting-settings.service';

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

    private _currentActiveMeetingId: Id | null = null;
    private _isConstructed = false;

    public constructor(
        protected override controllerServiceCollector: MeetingControllerServiceCollectorService,
        baseModelConstructor: ModelConstructor<M>,
        repo: BaseRepository<V, M>
    ) {
        super(controllerServiceCollector, baseModelConstructor, repo);
        controllerServiceCollector.activeMeetingIdService.meetingIdObservable.subscribe(id => this.onNextMeetingId(id));
        this._isConstructed = true;
    }

    /**
     * Function called every change of the active meeting id. Be careful: The `this` scope can be undefined for the first invokes.
     */
    protected onMeetingIdChanged(): void {}

    private onNextMeetingId(id: Id | null): void {
        if (id !== this._currentActiveMeetingId && this._isConstructed) {
            this.onMeetingIdChanged();
        }
        this._currentActiveMeetingId = id;
    }
}
