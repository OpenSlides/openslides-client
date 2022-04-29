import { NgModule } from '@angular/core';
import { OrganizationTagCommonServiceModule } from '../../../../organization-tags/services/organization-tag-common-service.module';
import { ExportServiceModule } from 'src/app/gateways/export';

@NgModule({ imports: [OrganizationTagCommonServiceModule, ExportServiceModule] })
export class CommitteeListServiceModule {}
