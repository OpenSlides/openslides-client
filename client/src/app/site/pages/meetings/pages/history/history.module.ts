import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

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
        MatPaginatorModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild(),
        HeadBarModule,
        SearchSelectorModule
    ],
    declarations: [HistoryListComponent, HistoryMainComponent, HistoryBannerComponent]
})
export class HistoryModule {}
