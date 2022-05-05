import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectorComponent } from './components/projector/projector.component';
import { MatIconModule } from '@angular/material/icon';
import { ProjectorClockComponent } from './components/projector-clock/projector-clock.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { SlideContainerComponent } from './components/slide-container/slide-container.component';
import { SlidesModule } from './modules/slides/slides.module';
import { CountdownTimeModule } from './modules/countdown-time/countdown-time.module';

const DECLARATIONS = [ProjectorComponent];
const EXPORTED_MODULES = [CountdownTimeModule];

@NgModule({
    declarations: [...DECLARATIONS, ProjectorClockComponent, SlideContainerComponent],
    exports: [...DECLARATIONS, ...EXPORTED_MODULES],
    imports: [CommonModule, MatIconModule, DirectivesModule, SlidesModule]
})
export class ProjectorModule {}
