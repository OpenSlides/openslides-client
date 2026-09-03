import { Directive, inject } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { BaseModel } from '@app/domain/models/base/base-model';
import { BaseController } from '@app/site/base/base-controller';
import { BaseViewModel } from '@app/site/base/base-view-model';
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
    protected get activeMeeting(): ViewMeeting | null {
        return this.activeMeetingService.meeting;
    }

    protected get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    private _currentActiveMeetingId: Id | null = null;
    private _isConstructed = false;

    protected activeMeetingService = inject(ActiveMeetingService);
    protected activeMeetingIdService = inject(ActiveMeetingIdService);
    protected collectionMapperService = inject(MeetingCollectionMapperService);
    protected meetingSettingsService = inject(MeetingSettingsService);

    public constructor() {
        super();
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
