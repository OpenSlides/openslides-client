import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';

import { SharedMotionModule } from '../shared-motion/shared-motion.module';
import { MotionListComponent } from './components/motion-list/motion-list.component';
import { MotionListRoutingModule } from './motion-list-routing.module';

@NgModule({
    imports: [CommonModule, MotionListRoutingModule, SharedModule, SharedMotionModule],
    declarations: [MotionListComponent]
})
export class MotionListModule {}
