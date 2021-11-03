import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';

import { SharedMotionModule } from '../shared-motion/shared-motion.module';
import { AmendmentListComponent } from './amendment-list.component';
import { AmendmentListRoutingModule } from './amendment-list-routing.module';

@NgModule({
    declarations: [AmendmentListComponent],
    imports: [CommonModule, AmendmentListRoutingModule, SharedModule, SharedMotionModule]
})
export class AmendmentListModule {}
