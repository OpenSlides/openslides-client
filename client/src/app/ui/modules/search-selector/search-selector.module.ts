import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListSearchSelectorComponent } from './components/list-search-selector/list-search-selector.component';
import { RepoSearchSelectorComponent } from './components/repo-search-selector/repo-search-selector.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '../../../site/modules/translations';

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
