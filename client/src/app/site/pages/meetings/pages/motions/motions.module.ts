import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MotionMainComponent } from './components/motion-main/motion-main.component';
import { MotionsRoutingModule } from './motions-routing.module';

@NgModule({
    declarations: [MotionMainComponent],
    imports: [CommonModule, MotionsRoutingModule, RouterModule]
})
export class MotionsModule {}
