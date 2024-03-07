import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { ChoiceDialogComponent } from './components/choice-dialog/choice-dialog.component';

const DECLARATIONS = [ChoiceDialogComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        FormsModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class ChoiceDialogModule {}
