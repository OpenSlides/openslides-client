import { Directive } from '@angular/core';
import { BaseFilterListService } from 'src/app/site/base/base-filter.service';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { MeetingActiveFiltersService } from '../services/meeting-active-filters.service';

/**
 * This class exists to enforce the use of MeetingActiveFiltersService on FilterListservices within the meeting.
 */
@Directive()
export abstract class BaseMeetingFilterListService<V extends BaseViewModel> extends BaseFilterListService<V> {
    public constructor(meetingActiveFiltersService: MeetingActiveFiltersService) {
        super(meetingActiveFiltersService);
    }
}
