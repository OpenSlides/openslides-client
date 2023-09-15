import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
import { PromptCheckboxModule } from 'src/app/ui/modules/prompt-checkbox';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

import { ThemeBuilderDialogModule } from '../../modules/theme-builder-dialog/theme-builder-dialog.module';
import { ThemeCommonServiceModule } from '../../services/theme-common-service.module';
import { ThemeListComponent } from './components/theme-list/theme-list.component';
import { ThemeListRoutingModule } from './theme-list-routing.module';

@NgModule({
    declarations: [ThemeListComponent],
    imports: [
        CommonModule,
        ThemeListRoutingModule,
        ThemeCommonServiceModule,
        ThemeBuilderDialogModule,
        PromptDialogModule,
        HeadBarModule,
        ListModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatButtonModule,
        MatCheckboxModule,
        PromptCheckboxModule
    ]
})
export class ThemeListModule {}
