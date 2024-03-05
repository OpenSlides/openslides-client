import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { DirectivesModule } from 'src/app/ui/directives';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
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
        CommaSeparatedListingModule,
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
