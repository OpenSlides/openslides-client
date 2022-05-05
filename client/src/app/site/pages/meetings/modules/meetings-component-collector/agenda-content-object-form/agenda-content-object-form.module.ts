import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaContentObjectFormComponent } from './components/agenda-content-object-form/agenda-content-object-form.component';
import { AgendaContentObjectFormService } from './services/agenda-content-object-form.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { MatSelectModule } from '@angular/material/select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from 'src/app/ui/directives';

const DECLARATIONS = [AgendaContentObjectFormComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        ReactiveFormsModule,
        DirectivesModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild()
    ],
    providers: [AgendaContentObjectFormService]
})
export class AgendaContentObjectFormModule {}
