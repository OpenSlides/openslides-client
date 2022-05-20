import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from 'src/app/ui/directives';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatIconModule } from '@angular/material/icon';
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
