import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { UserComponentsModule } from '@app/site/modules/user-components';
import { CommitteeCommonServiceModule } from '@app/site/pages/organization/pages/committees/services/committee-common-service.module';
import { DirectivesModule } from '@app/ui/directives';
import { CommaSeparatedListingComponent } from '@app/ui/modules/comma-separated-listing';
import { EditorModule } from '@app/ui/modules/editor';
import { ExpandableContentWrapperComponent } from '@app/ui/modules/expandable-content-wrapper';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';
import { PipesModule } from '@app/ui/pipes/pipes.module';

import { ParticipantExportModule } from '../../export/participant-export.module';
import { ParticipantDetailComponent } from './components/participant-detail/participant-detail.component';
import { ParticipantDetailEditComponent } from './components/participant-detail-edit/participant-detail-edit.component';
import { ParticipantDetailViewComponent } from './components/participant-detail-view/participant-detail-view.component';
import { ParticipantDetailRoutingModule } from './participant-detail-routing.module';

@NgModule({
    declarations: [ParticipantDetailComponent, ParticipantDetailViewComponent, ParticipantDetailEditComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingComponent,
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
        PipesModule,
        ExpandableContentWrapperComponent,
        CommitteeCommonServiceModule
    ]
})
export class ParticipantDetailModule {}
