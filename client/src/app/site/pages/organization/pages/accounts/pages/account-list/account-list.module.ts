import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountListComponent } from './components/account-list/account-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { AccountListRoutingModule } from './account-list-routing.module';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatButtonModule } from '@angular/material/button';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { AccountListServiceModule } from './services/account-list-service.module';
import { AccountCommonServiceModule } from '../../services/common/account-common-service.module';
import { AccountExportServiceModule } from '../../services/account-export-service.module';
import { AccountListMainComponent } from './components/account-list-main/account-list-main.component';

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
