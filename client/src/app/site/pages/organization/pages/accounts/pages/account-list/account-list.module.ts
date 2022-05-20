import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';

import { AccountExportServiceModule } from '../../services/account-export-service.module';
import { AccountCommonServiceModule } from '../../services/common/account-common-service.module';
import { AccountListRoutingModule } from './account-list-routing.module';
import { AccountListComponent } from './components/account-list/account-list.component';
import { AccountListMainComponent } from './components/account-list-main/account-list-main.component';
import { AccountListServiceModule } from './services/account-list-service.module';

@NgModule({
    declarations: [AccountListComponent, AccountListMainComponent],
    imports: [
        CommonModule,
        AccountListRoutingModule,
        AccountListServiceModule,
        AccountExportServiceModule,
        AccountCommonServiceModule,
        DirectivesModule,
        ChoiceDialogModule,
        HeadBarModule,
        ListModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatButtonModule,
        OpenSlidesTranslationModule.forChild(),
        MatFormFieldModule,
        IconContainerModule,
        RouterModule
    ]
})
export class AccountListModule {}
