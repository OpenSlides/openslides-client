import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParticipantDetailRoutingModule } from './participant-detail-routing.module';
import { ParticipantDetailComponent } from './components/participant-detail/participant-detail.component';
import { ParticipantDetailViewComponent } from './components/participant-detail-view/participant-detail-view.component';
import { RouterModule } from '@angular/router';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/ui/modules/user-components';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditorModule } from 'src/app/ui/modules/editor';
import { MatDividerModule } from '@angular/material/divider';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';
import { ParticipantExportModule } from '../../export/participant-export.module';

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
        ReactiveFormsModule
    ]
})
export class ParticipantDetailModule {}
