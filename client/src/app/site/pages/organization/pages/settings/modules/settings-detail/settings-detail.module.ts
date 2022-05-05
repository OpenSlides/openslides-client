import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsDetailRoutingModule } from './settings-detail-routing.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { OrganizationSettingsComponent } from './components/organization-settings/organization-settings.component';
import { MatInputModule } from '@angular/material/input';

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
        MatCardModule,
        MatCheckboxModule,
        OpenSlidesTranslationModule.forChild(),
        DirectivesModule
    ]
})
export class SettingsDetailModule {}
