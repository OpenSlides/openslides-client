import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';
import { PipesModule } from 'src/app/ui/pipes';

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
        UserComponentsModule,
        PromptDialogModule,
        DirectivesModule,
        ChoiceDialogModule,
        HeadBarModule,
        ListModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        MatButtonModule,
        OpenSlidesTranslationModule.forChild(),
        MatFormFieldModule,
        IconContainerModule,
        RouterModule,
        PipesModule
    ]
})
export class AccountListModule {}
