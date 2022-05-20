import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PipesModule } from 'src/app/ui/pipes';

import { SlideToken } from '../../definitions';
import { AssignmentSlideComponent } from './components/assignment-slide/assignment-slide.component';

@NgModule({
    imports: [CommonModule, PipesModule, OpenSlidesTranslationModule.forChild()],
    declarations: [AssignmentSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: AssignmentSlideComponent }]
})
export class AssignmentSlideModule {}
