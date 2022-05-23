import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from 'src/app/ui/pipes';

import { SlideToken } from '../../definitions';
import { TopicSlideComponent } from './components/topic-slide/topic-slide.component';

@NgModule({
    imports: [CommonModule, PipesModule],
    declarations: [TopicSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: TopicSlideComponent }]
})
export class TopicSlideModule {}
