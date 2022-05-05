import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountImportListComponent } from './components/account-import-list/account-import-list.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ImportListModule } from 'src/app/ui/modules/import-list';
import { AccountImportRoutingModule } from './account-import-routing.module';
import { AccountImportServiceModule } from './services/account-import-service.module';
import { AccountCommonServiceModule } from '../../services/common/account-common-service.module';

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
