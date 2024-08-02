import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
