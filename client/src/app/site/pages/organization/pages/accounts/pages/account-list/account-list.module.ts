import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogComponent } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';
import { PipesModule } from 'src/app/ui/pipes';

import { AccountExportServiceModule } from '../../services/account-export-service.module';
import { AccountCommonServiceModule } from '../../services/common/account-common-service.module';
import { AccountListRoutingModule } from './account-list-routing.module';
import { AccountListComponent } from './components/account-list/account-list.component';
import { AccountListMainComponent } from './components/account-list-main/account-list-main.component';
import { AccountMergeDialogComponent } from './components/account-merge-dialog/account-merge-dialog.component';
import { AccountListServiceModule } from './services/account-list-service.module';

@NgModule({
    declarations: [AccountListComponent, AccountListMainComponent, AccountMergeDialogComponent],
    imports: [
        CommonModule,
        AccountListRoutingModule,
        AccountListServiceModule,
        AccountExportServiceModule,
        AccountCommonServiceModule,
        UserComponentsModule,
        PromptDialogModule,
        DirectivesModule,
        ChoiceDialogComponent,
        HeadBarModule,
        ListModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatButtonModule,
        OpenSlidesTranslationModule.forChild(),
        MatFormFieldModule,
        IconContainerComponent,
        RouterModule,
        PipesModule,
        MatDialogModule,
        MatRadioModule,
        MatTableModule
    ]
})
export class AccountListModule {}
