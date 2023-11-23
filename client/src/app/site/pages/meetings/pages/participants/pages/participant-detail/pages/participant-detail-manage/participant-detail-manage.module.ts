import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
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
        MatIconModule,
        ReactiveFormsModule
    ]
})
export class ParticipantDetailManageModule {}
