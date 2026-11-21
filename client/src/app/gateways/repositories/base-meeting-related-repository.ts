import { inject, Service } from '@angular/core';
import { HasMeetingId } from '@app/domain/interfaces';

import { Id } from '../../domain/definitions/key-types';
import { BaseModel } from '../../domain/models/base/base-model';
import { BaseViewModel } from '../../site/base/base-view-model';
import { ActiveMeetingIdService } from '../../site/pages/meetings/services/active-meeting-id.service';
import { BaseRepository } from './base-repository';

/**
 * Extension of the base repository for all meeting specific models. Provides access
 * to the active meeting id service and automatically inserts the id on viewmodel creates.
 */
@Service()
export abstract class BaseMeetingRelatedRepository<V extends BaseViewModel, M extends BaseModel> extends BaseRepository<
    V,
    M
> {
    public readonly resetOnMeetingChange: boolean = true;

    protected get activeMeetingId(): Id | null {
        return this.activeMeetingIdService.meetingId;
    }

    protected activeMeetingIdService = inject(ActiveMeetingIdService);

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
