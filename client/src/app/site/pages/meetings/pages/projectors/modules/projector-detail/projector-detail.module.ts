import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { GridModule } from 'src/app/ui/modules/grid';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';

import { ProjectionDialogModule } from '../../../../modules/meetings-component-collector/projection-dialog/projection-dialog.module';
import { ProjectorModule } from '../../../../modules/projector/projector.module';
import { ProjectorCountdownDialogModule } from '../../components/projector-countdown-dialog/projector-countdown-dialog.module';
import { ProjectorEditDialogModule } from '../../components/projector-edit-dialog/projector-edit-dialog.module';
import { ProjectorMessageDialogModule } from '../../components/projector-message-dialog/projector-message-dialog.module';
import { CountdownControlsComponent } from './components/countdown-controls/countdown-controls.component';
import { MessageControlsComponent } from './components/message-controls/message-controls.component';
import { PresentationControlsComponent } from './components/presentation-controls/presentation-controls.component';
import { ProjectorDetailComponent } from './components/projector-detail/projector-detail.component';
import { ProjectorDetailRoutingModule } from './projector-detail-routing.module';
import { ProjectorDetailServiceModule } from './services/projector-detail-service.module';

@NgModule({
    declarations: [
        ProjectorDetailComponent,
        MessageControlsComponent,
        CountdownControlsComponent,
        PresentationControlsComponent
    ],
    imports: [
        CommonModule,
        ProjectorDetailRoutingModule,
        ProjectorDetailServiceModule,
        ProjectorEditDialogModule,
        ProjectorCountdownDialogModule,
        ProjectorMessageDialogModule,
        ProjectorModule,
        ProjectionDialogModule,
        IconContainerComponent,
        GridModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild(),
        MeetingsComponentCollectorModule,
        HeadBarModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatListModule,
        MatTooltipModule,
        MatExpansionModule,
        MatCardModule,
        DragDropModule
    ]
})
export class ProjectorDetailModule {}
