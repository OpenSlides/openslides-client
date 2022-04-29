import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoiceDialogComponent } from './components/choice-dialog/choice-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

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
