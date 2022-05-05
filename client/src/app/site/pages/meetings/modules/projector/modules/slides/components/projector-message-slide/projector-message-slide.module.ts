import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from 'src/app/ui/pipes';
import { SlideToken } from '../../definitions';
import { ProjectorMessageSlideComponent } from './components/projector-message-slide/projector-message-slide.component';

@NgModule({
    imports: [CommonModule, PipesModule],
    declarations: [ProjectorMessageSlideComponent],
    providers: [{ provide: SlideToken.token, useValue: ProjectorMessageSlideComponent }]
})
export class ProjectorMessageSlideModule {}
