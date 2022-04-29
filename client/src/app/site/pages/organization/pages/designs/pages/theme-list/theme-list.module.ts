import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThemeListRoutingModule } from './theme-list-routing.module';
import { ThemeListComponent } from './components/theme-list/theme-list.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { ThemeCommonServiceModule } from '../../services/theme-common-service.module';
import { ThemeBuilderDialogModule } from '../../modules/theme-builder-dialog/theme-builder-dialog.module';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

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
        MatButtonModule
    ]
})
export class ThemeListModule {}
