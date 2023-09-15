import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
import { GridModule } from 'src/app/ui/modules/grid';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';

import { MotionExportDialogModule } from '../../components/motion-export-dialog/motion-export-dialog.module';
import { MotionForwardDialogModule } from '../../components/motion-forward-dialog/motion-forward-dialog.module';
import { MotionMultiselectModule } from '../../components/motion-multiselect/motion-multiselect.module';
import { MotionsListServiceModule } from '../../services/list/motions-list-service.module';
import { MotionListComponent } from './components/motion-list/motion-list.component';
import { MotionListInfoDialogModule } from './modules/motion-list-info-dialog/motion-list-info-dialog.module';
import { MotionListRoutingModule } from './motion-list-routing.module';

@NgModule({
    declarations: [MotionListComponent],
    imports: [
        CommonModule,
        CommaSeparatedListingModule,
        MotionListRoutingModule,
        MotionsListServiceModule,
        MotionListInfoDialogModule,
        MotionForwardDialogModule,
        MotionExportDialogModule,
        MotionMultiselectModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatTooltipModule,
        MatMenuModule,
        MatChipsModule,
        MatBadgeModule,
        MatDividerModule,
        OpenSlidesTranslationModule.forChild(),
        HeadBarModule,
        MeetingsComponentCollectorModule,
        GridModule,
        IconContainerModule,
        PipesModule,
        DirectivesModule
    ]
})
export class MotionListModule {}
