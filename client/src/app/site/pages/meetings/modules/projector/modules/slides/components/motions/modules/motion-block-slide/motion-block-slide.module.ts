import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { SlideToken } from '../../../../definitions/slide-token';
import { MotionBlockSlideComponent } from './components/motion-block-slide/motion-block-slide.component';

@NgModule({
    imports: [CommonModule, OpenSlidesTranslationModule.forChild()],
    declarations: [MotionBlockSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: MotionBlockSlideComponent }]
})
export class MotionBlockSlideModule {}
