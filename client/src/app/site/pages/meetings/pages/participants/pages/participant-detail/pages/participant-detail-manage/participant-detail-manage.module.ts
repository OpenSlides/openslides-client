import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { EditorModule } from 'src/app/ui/modules/editor';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { ParticipantCreateWizardComponent } from './components/participant-create-wizard/participant-create-wizard.component';
import { ParticipantDetailManageRoutingModule } from './participant-detail-manage-routing.module';

@NgModule({
    declarations: [ParticipantCreateWizardComponent],
    imports: [
        CommonModule,
        ParticipantDetailManageRoutingModule,
        HeadBarModule,
        UserComponentsModule,
        SearchSelectorModule,
        EditorModule,
        OpenSlidesTranslationModule.forChild(),
        MatStepperModule,
        MatCardModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatDividerModule,
        MatListModule,
        ReactiveFormsModule
    ]
})
export class ParticipantDetailManageModule {}
