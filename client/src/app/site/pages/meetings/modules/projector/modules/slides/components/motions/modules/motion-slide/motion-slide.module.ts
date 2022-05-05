import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from 'src/app/ui/pipes';
import { SlideToken } from '../../../../definitions';
import { MotionSlideComponent } from './components/motion-slide/motion-slide.component';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MotionsCommonServiceModule } from 'src/app/site/pages/meetings/pages/motions/services/common/motions-service.module';
@NgModule({
    imports: [CommonModule, PipesModule, OpenSlidesTranslationModule.forChild(), MotionsCommonServiceModule],
    declarations: [MotionSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: MotionSlideComponent }]
})
export class MotionSlideModule {}
