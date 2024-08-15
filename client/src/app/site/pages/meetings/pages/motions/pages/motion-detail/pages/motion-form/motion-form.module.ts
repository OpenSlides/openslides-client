import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DetailViewModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector/detail-view/detail-view.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

import { MotionFormComponent } from './components/motion-form/motion-form.component';
import { MotionFormRoutingModule } from './motion-form-routing.module';

@NgModule({
    declarations: [MotionFormComponent],
    imports: [
        CommonModule,
        MotionFormRoutingModule,
        HeadBarModule,
        DetailViewModule,
        MatCardModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class MotionFormModule {}
