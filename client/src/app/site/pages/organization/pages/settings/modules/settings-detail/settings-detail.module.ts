import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { OrganizationSettingsComponent } from './components/organization-settings/organization-settings.component';
import { SettingsDetailRoutingModule } from './settings-detail-routing.module';

@NgModule({
    declarations: [OrganizationSettingsComponent],
    imports: [
        CommonModule,
        SettingsDetailRoutingModule,
        MatFormFieldModule,
        MatInputModule,
        HeadBarModule,
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatCardModule,
        MatCheckboxModule,
        OpenSlidesTranslationModule.forChild(),
        DirectivesModule
    ]
})
export class SettingsDetailModule {}
