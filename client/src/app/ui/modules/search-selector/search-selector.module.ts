import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { OpenSlidesTranslationModule } from '../../../site/modules/translations';
import { ListSearchSelectorComponent } from './components/list-search-selector/list-search-selector.component';
import { RepoSearchSelectorComponent } from './components/repo-search-selector/repo-search-selector.component';

const DECLARATIONS = [ListSearchSelectorComponent, RepoSearchSelectorComponent];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [
        CommonModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatChipsModule,
        MatTooltipModule,
        ScrollingModule,
        NgxMatSelectSearchModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class SearchSelectorModule {}
