import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { DirectivesModule } from 'src/app/ui/directives';

import { OpenSlidesTranslationModule } from '../../../site/modules/translations';
import { ListSearchSelectorComponent } from './components/list-search-selector/list-search-selector.component';
import { RepoSearchSelectorComponent } from './components/repo-search-selector/repo-search-selector.component';
import { SearchSelectorNotFoundTemplateDirective } from './directives/search-selector-not-found-template.directive';

const DECLARATIONS = [
    ListSearchSelectorComponent,
    RepoSearchSelectorComponent,
    SearchSelectorNotFoundTemplateDirective
];

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
        MatButtonModule,
        ScrollingModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class SearchSelectorModule {}
