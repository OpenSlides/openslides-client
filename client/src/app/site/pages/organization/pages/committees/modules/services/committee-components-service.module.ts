import { NgModule } from '@angular/core';
import { AccountCommonServiceModule } from '../../../accounts/services/common/account-common-service.module';
import { ExportServiceModule } from 'src/app/gateways/export';

@NgModule({ imports: [AccountCommonServiceModule, ExportServiceModule] })
export class CommitteeComponentsServiceModule {}
