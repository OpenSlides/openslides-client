import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PipesModule } from 'src/app/ui/pipes';

import { SlideToken } from '../../../../definitions';
import { MotionSlideComponent } from './components/motion-slide/motion-slide.component';
@NgModule({
    imports: [CommonModule, PipesModule, OpenSlidesTranslationModule.forChild()],
    declarations: [MotionSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: MotionSlideComponent }]
})
export class MotionSlideModule {}
