import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { DirectivesModule } from 'src/app/ui/directives';
import { EditorModule } from 'src/app/ui/modules/editor';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { ParticipantExportModule } from '../../export/participant-export.module';
import { ParticipantDetailComponent } from './components/participant-detail/participant-detail.component';
import { ParticipantDetailViewComponent } from './components/participant-detail-view/participant-detail-view.component';
import { ParticipantDetailRoutingModule } from './participant-detail-routing.module';

@NgModule({
    declarations: [ParticipantDetailComponent, ParticipantDetailViewComponent],
    imports: [
        CommonModule,
        ParticipantDetailRoutingModule,
        ParticipantExportModule,
        RouterModule,
        SearchSelectorModule,
        EditorModule,
        OpenSlidesTranslationModule.forChild(),
        UserComponentsModule,
        PipesModule,
        HeadBarModule,
        MatTooltipModule,
        MatMenuModule,
        MatIconModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        DirectivesModule,
        PipesModule
    ]
})
export class ParticipantDetailModule {}
