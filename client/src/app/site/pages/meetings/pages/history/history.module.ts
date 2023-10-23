import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes';

import { HistoryBannerComponent } from './components/history-banner/history-banner.component';
import { HistoryListComponent } from './components/history-list/history-list.component';
import { HistoryMainComponent } from './components/history-main/history-main.component';
import { HistoryRoutingModule } from './history-routing.module';

/**
 * App module for the history feature.
 * Declares the used components.
 */
@NgModule({
    imports: [
        CommonModule,
        HistoryRoutingModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild(),
        HeadBarModule,
        SearchSelectorModule,
        PipesModule
    ],
    declarations: [HistoryListComponent, HistoryMainComponent, HistoryBannerComponent]
})
export class HistoryModule {}
