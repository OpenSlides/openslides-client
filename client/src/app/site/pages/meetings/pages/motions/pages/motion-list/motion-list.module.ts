import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { MeetingsComponentCollectorModule } from '@app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from '@app/ui/directives';
import { CommaSeparatedListingComponent } from '@app/ui/modules/comma-separated-listing';
import { GridModule } from '@app/ui/modules/grid';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { PipesModule } from '@app/ui/pipes/pipes.module';

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
        CommaSeparatedListingComponent,
        MotionListRoutingModule,
        MotionsListServiceModule,
        MotionListInfoDialogModule,
        MotionForwardDialogModule,
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
        IconContainerComponent,
        PipesModule,
        DirectivesModule
    ]
})
export class MotionListModule {}
