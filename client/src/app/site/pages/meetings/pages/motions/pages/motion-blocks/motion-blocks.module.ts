import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerModule } from 'src/app/ui/modules/icon-container/icon-container.module';

import { AgendaItemCommonServiceModule } from '../../../agenda/services/agenda-item-common-service.module';
import { MotionBlockCreateDialogModule } from './components/motion-block-create-dialog/motion-block-create-dialog.module';
import { MotionBlockDetailComponent } from './components/motion-block-detail/motion-block-detail.component';
import { MotionBlockEditDialogModule } from './components/motion-block-edit-dialog/motion-block-edit-dialog.module';
import { MotionBlockListComponent } from './components/motion-block-list/motion-block-list.component';
import { MotionBlocksRoutingModule } from './motion-blocks-routing.module';
import { MotionBlockServiceModule } from './services/motion-block-service.module';

@NgModule({
    declarations: [MotionBlockDetailComponent, MotionBlockListComponent],
    imports: [
        CommonModule,
        MotionBlocksRoutingModule,
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
