import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MotionBlockSlideComponent } from './components/motion-block-slide/motion-block-slide.component';
import { SlideToken } from '../../../../definitions/slide-token';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

@NgModule({
    imports: [CommonModule, OpenSlidesTranslationModule.forChild()],
    declarations: [MotionBlockSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: MotionBlockSlideComponent }]
})
export class MotionBlockSlideModule {}
