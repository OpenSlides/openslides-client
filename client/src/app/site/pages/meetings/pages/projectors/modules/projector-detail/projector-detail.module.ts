import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { GridModule } from 'src/app/ui/modules/grid';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

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
