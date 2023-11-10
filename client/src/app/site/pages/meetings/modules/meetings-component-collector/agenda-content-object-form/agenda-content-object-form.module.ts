import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { AgendaContentObjectFormComponent } from './components/agenda-content-object-form/agenda-content-object-form.component';
import { AgendaContentObjectFormService } from './services/agenda-content-object-form.service';

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
