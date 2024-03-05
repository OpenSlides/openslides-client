import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ParticipantCommonServiceModule } from '../participants/services/common/participant-common-service.module';
import { MotionMainComponent } from './components/motion-main/motion-main.component';
import { MotionsRoutingModule } from './motions-routing.module';

@NgModule({
    declarations: [MotionMainComponent],
    imports: [CommonModule, MotionsRoutingModule, RouterModule, ParticipantCommonServiceModule]
})
export class MotionsModule {}
