import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { MotionExportDialogModule } from '../../components/motion-export-dialog/motion-export-dialog.module';
import { MotionMultiselectModule } from '../../components/motion-multiselect/motion-multiselect.module';
import { MotionsExportModule } from '../../services/export/motions-export.module';
import { MotionsListServiceModule } from '../../services/list/motions-list-service.module';
import { AmendmentsRoutingModule } from './amendments-routing.module';
import { AmendmentListComponent } from './components/amendment-list/amendment-list.component';
import { AmendmentListMainComponent } from './components/amendment-list-main/amendment-list-main.component';

@NgModule({
    declarations: [AmendmentListComponent, AmendmentListMainComponent],
    imports: [
        CommonModule,
        AmendmentsRoutingModule,
        HeadBarModule,
        PipesModule,
        DirectivesModule,
        MotionMultiselectModule,
        MotionsListServiceModule,
        MotionsExportModule,
        MotionExportDialogModule,
        MeetingsComponentCollectorModule,
        MatMenuModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class AmendmentsModule {}
