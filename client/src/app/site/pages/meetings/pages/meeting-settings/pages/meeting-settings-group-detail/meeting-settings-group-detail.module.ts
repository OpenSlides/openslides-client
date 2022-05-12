import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MeetingSettingsGroupDetailRoutingModule } from './meeting-settings-group-detail-routing.module';
import { MeetingSettingsGroupDetailComponent } from './components/meeting-settings-group-detail/meeting-settings-group-detail.component';
import { MeetingSettingsGroupDetailFieldComponent } from './components/meeting-settings-group-detail-field/meeting-settings-group-detail-field.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatDatepickerModule } from '@angular/material/datepicker';
// time picker because angular still doesnt offer one!!
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { EditorModule } from 'src/app/ui/modules/editor';
import { MatInputModule } from '@angular/material/input';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PipesModule } from 'src/app/ui/pipes';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CustomTranslationComponent } from './components/custom-translation/custom-translation.component';
import { MeetingSettingsGroupDetailMainComponent } from './components/meeting-settings-group-detail-main/meeting-settings-group-detail-main.component';

@NgModule({
    declarations: [
        MeetingSettingsGroupDetailComponent,
        MeetingSettingsGroupDetailFieldComponent,
        CustomTranslationComponent,
        MeetingSettingsGroupDetailMainComponent
    ],
    imports: [
        CommonModule,
        SearchSelectorModule,
        EditorModule,
        HeadBarModule,
        PipesModule,
        OpenSlidesTranslationModule.forChild(),
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
        ReactiveFormsModule
    ]
})
export class MeetingSettingsGroupDetailModule {}
