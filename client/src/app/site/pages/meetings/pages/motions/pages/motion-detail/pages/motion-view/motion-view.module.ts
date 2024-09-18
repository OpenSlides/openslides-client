import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { MotionViewRoutingModule } from './motion-view-routing.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, MotionViewRoutingModule, OpenSlidesTranslationModule.forChild()]
})
export class MotionViewModule {}
