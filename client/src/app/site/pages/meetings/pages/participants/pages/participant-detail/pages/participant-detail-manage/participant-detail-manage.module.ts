import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParticipantDetailManageRoutingModule } from './participant-detail-manage-routing.module';
import { ParticipantCreateWizardComponent } from './components/participant-create-wizard/participant-create-wizard.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserComponentsModule } from 'src/app/ui/modules/user-components';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { EditorModule } from 'src/app/ui/modules/editor';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

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
