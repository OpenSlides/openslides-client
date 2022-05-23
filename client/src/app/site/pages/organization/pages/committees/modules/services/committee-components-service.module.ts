import { NgModule } from '@angular/core';
import { ExportServiceModule } from 'src/app/gateways/export';

import { AccountCommonServiceModule } from '../../../accounts/services/common/account-common-service.module';

@NgModule({ imports: [AccountCommonServiceModule, ExportServiceModule] })
export class CommitteeComponentsServiceModule {}
