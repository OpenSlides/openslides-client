import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ImportListModule } from 'src/app/ui/modules/import-list';

import { AccountCommonServiceModule } from '../../services/common/account-common-service.module';
import { AccountImportRoutingModule } from './account-import-routing.module';
import { AccountImportListComponent } from './components/account-import-list/account-import-list.component';
import { AccountImportServiceModule } from './services/account-import-service.module';

@NgModule({
    declarations: [AccountImportListComponent],
    imports: [
        CommonModule,
        AccountImportRoutingModule,
        AccountImportServiceModule,
        AccountCommonServiceModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        ImportListModule
    ]
})
export class AccountImportModule {}
