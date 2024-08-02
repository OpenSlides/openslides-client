import { Directive, inject } from '@angular/core';

import { MeetingComponentServiceCollectorService } from '../pages/meetings/services/meeting-component-service-collector.service';
import { BaseViaBackendImportListComponent } from './base-via-backend-import-list.component';

@Directive()
export abstract class BaseViaBackendImportListMeetingComponent extends BaseViaBackendImportListComponent {
    protected override componentServiceCollector = inject(MeetingComponentServiceCollectorService);
}
