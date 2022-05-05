import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotionsRoutingModule } from './motions-routing.module';
import { MotionMainComponent } from './components/motion-main/motion-main.component';
import { RouterModule } from '@angular/router';

@NgModule({
    declarations: [MotionMainComponent],
    imports: [CommonModule, MotionsRoutingModule, RouterModule]
})
export class MotionsModule {}
