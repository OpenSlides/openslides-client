import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountSearchSelectorComponent } from './components/account-search-selector/account-search-selector.component';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

const DECLARATIONS = [AccountSearchSelectorComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        SearchSelectorModule,
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatIconModule,
        MatChipsModule,
        MatTooltipModule,
        ScrollingModule,
        NgxMatSelectSearchModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class AccountSearchSelectorModule {}
