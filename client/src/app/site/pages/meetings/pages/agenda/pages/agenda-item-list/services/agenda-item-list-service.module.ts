import { NgModule } from '@angular/core';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';

import { TagCommonServiceModule } from '../../../../motions/modules/tags/tag-common-service.module';

@NgModule({
    imports: [TagCommonServiceModule, MeetingPdfExportModule]
})
export class AgendaItemListServiceModule {}
