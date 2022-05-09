import { AppInjector } from 'src/app/openslides-main-module/services/app-injector.service';

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
export abstract class BaseMeetingRelatedRepository<V extends BaseViewModel, M extends BaseModel> extends BaseRepository<
    V,
    M
> {
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

    // Services which are injected manually to be available in all subclasses
    protected activeMeetingIdService: ActiveMeetingIdService;
    protected activeMeetingService: ActiveMeetingService;
    protected meetingSettingsService: MeetingSettingsService;

    public constructor(baseModelCtor: ModelConstructor<M>) {
        super(baseModelCtor);
        const injector = AppInjector.getInjector();
        this.activeMeetingIdService = injector.get(ActiveMeetingIdService);
        this.activeMeetingService = injector.get(ActiveMeetingService);
        this.meetingSettingsService = injector.get(MeetingSettingsService);
    }

    protected override createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.getActiveMeetingId = () => this.activeMeetingIdService.meetingId;
        return viewModel;
    }
}
