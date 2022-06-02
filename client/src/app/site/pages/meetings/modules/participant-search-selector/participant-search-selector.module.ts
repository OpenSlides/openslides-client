import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { ParticipantSearchSelectorComponent } from './components/participant-search-selector/participant-search-selector.component';

@NgModule({
    declarations: [ParticipantSearchSelectorComponent],
    imports: [
        CommonModule,
        MatIconModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        DirectivesModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild()
    ],
    exports: [ParticipantSearchSelectorComponent]
})
export class ParticipantSearchSelectorModule {}
