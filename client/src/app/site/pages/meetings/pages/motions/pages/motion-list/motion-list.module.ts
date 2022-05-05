import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotionListRoutingModule } from './motion-list-routing.module';
import { MotionListComponent } from './components/motion-list/motion-list.component';
import { MotionsListServiceModule } from '../../services/list/motions-list-service.module';
import { MotionsCommonServiceModule } from '../../services/common/motions-service.module';
import { MotionListInfoDialogModule } from './modules/motion-list-info-dialog/motion-list-info-dialog.module';
import { MotionForwardDialogModule } from '../../components/motion-forward-dialog/motion-forward-dialog.module';
import { MotionExportDialogModule } from '../../components/motion-export-dialog/motion-export-dialog.module';
import { MotionCategoryCommonServiceModule } from '../../modules/categories/motion-categorie-common-service.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { GridModule } from 'src/app/ui/modules/grid';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';
import { PipesModule } from 'src/app/ui/pipes/pipes.module';
import { MotionMultiselectModule } from '../../components/motion-multiselect/motion-multiselect.module';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatCardModule } from '@angular/material/card';

@NgModule({
    declarations: [MotionListComponent],
    imports: [
        CommonModule,
        MotionListRoutingModule,
        MotionsListServiceModule,
        MotionListInfoDialogModule,
        MotionForwardDialogModule,
        MotionExportDialogModule,
        MotionCategoryCommonServiceModule,
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
