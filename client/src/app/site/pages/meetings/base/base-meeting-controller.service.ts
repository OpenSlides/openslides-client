import { Directive } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { AppInjector } from 'src/app/openslides-main-module/services/app-injector.service';
import { BaseController } from 'src/app/site/base/base-controller';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { ActiveMeetingService } from '../services/active-meeting.service';
import { ActiveMeetingIdService } from '../services/active-meeting-id.service';
import { MeetingCollectionMapperService } from '../services/meeting-collection-mapper.service';
import { MeetingSettingsService } from '../services/meeting-settings.service';

@Directive()
export abstract class BaseMeetingControllerService<V extends BaseViewModel, M extends BaseModel> extends BaseController<
    V,
    M
> {
    protected get activeMeeting(): ViewMeeting | null {
        return this.activeMeetingService.meeting;
    }

    protected get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    // Services which are injected manually to be available in all subclasses
    protected activeMeetingIdService: ActiveMeetingIdService;
    protected activeMeetingService: ActiveMeetingService;
    protected collectionMapperService: MeetingCollectionMapperService;
    protected meetingSettingsService: MeetingSettingsService;

    private _currentActiveMeetingId: Id | null = null;
    private _isConstructed = false;

    public constructor(baseModelConstructor: ModelConstructor<M>, repo: BaseRepository<V, M>) {
        super(baseModelConstructor, repo);
        const injector = AppInjector.getInjector();
        this.activeMeetingIdService = injector.get(ActiveMeetingIdService);
        this.activeMeetingService = injector.get(ActiveMeetingService);
        this.collectionMapperService = injector.get(MeetingCollectionMapperService);
        this.meetingSettingsService = injector.get(MeetingSettingsService);

        this.activeMeetingIdService.meetingIdObservable.subscribe(id => this.onNextMeetingId(id));
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
