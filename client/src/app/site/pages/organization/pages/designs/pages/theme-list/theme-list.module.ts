import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
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
        MatCheckboxModule
    ]
})
export class ThemeListModule {}
