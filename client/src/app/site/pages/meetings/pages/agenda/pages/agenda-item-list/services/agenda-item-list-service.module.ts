import { NgModule } from '@angular/core';
import { TagCommonServiceModule } from '../../../../motions/modules/tags/tag-common-service.module';
import { MeetingPdfExportModule } from 'src/app/site/pages/meetings/services/export';

@NgModule({
    imports: [TagCommonServiceModule, MeetingPdfExportModule]
})
export class AgendaItemListServiceModule {}
