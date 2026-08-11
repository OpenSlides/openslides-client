import { Directive, inject } from '@angular/core';
import { HasMeetingId } from '@app/domain/interfaces';

import { Id } from '../../domain/definitions/key-types';
import { BaseModel, ModelConstructor } from '../../domain/models/base/base-model';
import { BaseViewModel } from '../../site/base/base-view-model';
import { ActiveMeetingService } from '../../site/pages/meetings/services/active-meeting.service';
import { ActiveMeetingIdService } from '../../site/pages/meetings/services/active-meeting-id.service';
import { MeetingSettingsService } from '../../site/pages/meetings/services/meeting-settings.service';
import { ViewMeeting } from '../../site/pages/meetings/view-models/view-meeting';
import { BaseRepository } from './base-repository';

/**
 * Extension of the base repository for all meeting specific models. Provides access
 * to the active meeting service and automatically inserts the id on viewmodel creates.
 */
@Directive()
export abstract class BaseMeetingRelatedRepository<V extends BaseViewModel, M extends BaseModel> extends BaseRepository<
    V,
    M
> {
    public readonly resetOnMeetingChange: boolean = true;

    protected get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    protected get activeMeeting(): ViewMeeting | null {
        return this.activeMeetingService.meeting;
    }

    protected get currentDefaultGroupId(): Id | null {
        return this.activeMeeting?.default_group_id || null;
    }

    protected get currentAdminGroupId(): Id | null {
        return this.activeMeeting?.admin_group_id || null;
    }

    protected activeMeetingIdService = inject(ActiveMeetingIdService);
    protected activeMeetingService = inject(ActiveMeetingService);
    protected meetingSettingsService = inject(MeetingSettingsService);

    public constructor(baseModelCtor: ModelConstructor<M>) {
        super(baseModelCtor);
    }

    protected override createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.getActiveMeetingId = (): number => this.activeMeetingIdService.meetingId;
        return viewModel;
    }

    protected filterForeignMeetingModelsFromList(list: V[]): V[] {
        return list.filter(
            m =>
                !(m as unknown as HasMeetingId).meeting_id ||
                (m as unknown as HasMeetingId).meeting_id === this.activeMeetingId
        );
    }
}
