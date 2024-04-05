import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSelectModule } from '@angular/material/select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes';

import { ParticipantCommonServiceModule } from '../participants/services/common/participant-common-service.module';
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
        ParticipantCommonServiceModule,
        PipesModule
    ],
    declarations: [HistoryListComponent, HistoryMainComponent, HistoryBannerComponent]
})
export class HistoryModule {}
