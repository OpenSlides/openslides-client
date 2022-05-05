import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectorDetailRoutingModule } from './projector-detail-routing.module';
import { ProjectorDetailComponent } from './components/projector-detail/projector-detail.component';
import { ProjectorDetailServiceModule } from './services/projector-detail-service.module';
import { ProjectorEditDialogModule } from '../../components/projector-edit-dialog/projector-edit-dialog.module';
import { ProjectorCountdownDialogModule } from '../../components/projector-countdown-dialog/projector-countdown-dialog.module';
import { ProjectorMessageDialogModule } from '../../components/projector-message-dialog/projector-message-dialog.module';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ProjectorModule } from '../../../../modules/projector/projector.module';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MessageControlsComponent } from './components/message-controls/message-controls.component';
import { CountdownControlsComponent } from './components/countdown-controls/countdown-controls.component';
import { PresentationControlsComponent } from './components/presentation-controls/presentation-controls.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { GridModule } from 'src/app/ui/modules/grid';
import { DirectivesModule } from 'src/app/ui/directives';
import { ProjectionDialogModule } from '../../../../modules/meetings-component-collector/projection-dialog/projection-dialog.module';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

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
        PromptDialogModule,
        IconContainerModule,
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
