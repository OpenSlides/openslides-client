import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotionBlocksRoutingModule } from './motion-blocks-routing.module';
import { MotionBlockDetailComponent } from './components/motion-block-detail/motion-block-detail.component';
import { MotionBlockListComponent } from './components/motion-block-list/motion-block-list.component';
import { MotionBlockCommonServiceModule } from '../../modules';
import { MotionBlockServiceModule } from './services/motion-block-service.module';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { DirectivesModule } from 'src/app/ui/directives';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatDividerModule } from '@angular/material/divider';
import { AgendaItemCommonServiceModule } from '../../../agenda/services/agenda-item-common-service.module';
import { MotionBlockCreateDialogModule } from './components/motion-block-create-dialog/motion-block-create-dialog.module';
import { MotionsCommonServiceModule } from '../../services/common/motions-service.module';
import { MotionBlockEditDialogModule } from './components/motion-block-edit-dialog/motion-block-edit-dialog.module';

@NgModule({
    declarations: [MotionBlockDetailComponent, MotionBlockListComponent],
    imports: [
        CommonModule,
        MotionsCommonServiceModule,
        MotionBlocksRoutingModule,
        MotionBlockCommonServiceModule,
        MotionBlockServiceModule,
        MotionBlockCreateDialogModule,
        MotionBlockEditDialogModule,
        AgendaItemCommonServiceModule,
        MeetingsComponentCollectorModule,
        IconContainerModule,
        HeadBarModule,
        MatMenuModule,
        MatIconModule,
        MatTooltipModule,
        MatDividerModule,
        MatChipsModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionBlocksModule {}
