import { NgModule } from '@angular/core';
import { ExportServiceModule } from 'src/app/gateways/export';

import { OrganizationTagCommonServiceModule } from '../../../../organization-tags/services/organization-tag-common-service.module';

@NgModule({
    imports: [OrganizationTagCommonServiceModule, ExportServiceModule]
})
export class MeetingListServiceModule {}
