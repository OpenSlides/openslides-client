import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SlideToken } from '../../definitions';
import { AssignmentSlideComponent } from './components/assignment-slide/assignment-slide.component';
import { PipesModule } from 'src/app/ui/pipes';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

@NgModule({
    imports: [CommonModule, PipesModule, OpenSlidesTranslationModule.forChild()],
    declarations: [AssignmentSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: AssignmentSlideComponent }]
})
export class AssignmentSlideModule {}
