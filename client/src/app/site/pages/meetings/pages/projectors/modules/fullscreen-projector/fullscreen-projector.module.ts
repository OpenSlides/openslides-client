import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FullscreenProjectorRoutingModule } from './fullscreen-projector-routing.module';
import { FullscreenProjectorMainComponent } from './components/fullscreen-projector-main/fullscreen-projector-main.component';
import { FullscreenProjectorDetailComponent } from './components/fullscreen-projector-detail/fullscreen-projector-detail.component';
import { RouterModule } from '@angular/router';
import { ProjectorModule } from '../../../../modules/projector/projector.module';
import { DirectivesModule } from 'src/app/ui/directives';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { FullscreenProjectorComponent } from './components/fullscreen-projector/fullscreen-projector.component';

@NgModule({
    declarations: [FullscreenProjectorMainComponent, FullscreenProjectorDetailComponent, FullscreenProjectorComponent],
    imports: [
        CommonModule,
        FullscreenProjectorRoutingModule,
        RouterModule,
        ProjectorModule,
        DirectivesModule,
        MeetingsComponentCollectorModule
    ]
})
export class FullscreenProjectorModule {}
