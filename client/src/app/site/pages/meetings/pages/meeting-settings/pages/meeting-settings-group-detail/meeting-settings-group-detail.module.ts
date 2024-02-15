import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
// time picker because angular still doesnt offer one!!
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { DatepickerModule } from 'src/app/ui/modules/datepicker';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { LegacyEditorModule } from 'src/app/ui/modules/legacy-editor';
import { OpenSlidesDateAdapterModule } from 'src/app/ui/modules/openslides-date-adapter/openslides-date-adapter.module';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes';

import { AllocationListComponent } from './components/allocation-list/allocation-list.component';
import { MeetingSettingsGroupDetailComponent } from './components/meeting-settings-group-detail/meeting-settings-group-detail.component';
import { MeetingSettingsGroupDetailFieldComponent } from './components/meeting-settings-group-detail-field/meeting-settings-group-detail-field.component';
import { MeetingSettingsGroupDetailMainComponent } from './components/meeting-settings-group-detail-main/meeting-settings-group-detail-main.component';
import { MeetingSettingsGroupDetailRoutingModule } from './meeting-settings-group-detail-routing.module';

@NgModule({
    declarations: [
        MeetingSettingsGroupDetailComponent,
        MeetingSettingsGroupDetailFieldComponent,
        AllocationListComponent,
        MeetingSettingsGroupDetailMainComponent
    ],
    imports: [
        CommonModule,
        SearchSelectorModule,
        LegacyEditorModule,
        HeadBarModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild(),
        OpenSlidesDateAdapterModule,
        MeetingSettingsGroupDetailRoutingModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatMenuModule,
        MatCardModule,
        MatDatepickerModule,
        MatTooltipModule,
        MatInputModule,
        NgxMaterialTimepickerModule,
        FormsModule,
        ReactiveFormsModule,
        DatepickerModule,
        DirectivesModule
    ]
})
export class MeetingSettingsGroupDetailModule {}
