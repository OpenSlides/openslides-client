import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DirectivesModule } from 'src/app/ui/directives';

import { ProjectorComponent } from './components/projector/projector.component';
import { ProjectorClockComponent } from './components/projector-clock/projector-clock.component';
import { SlideContainerComponent } from './components/slide-container/slide-container.component';
import { CountdownTimeModule } from './modules/countdown-time/countdown-time.module';
import { SlidesModule } from './modules/slides/slides.module';

const DECLARATIONS = [ProjectorComponent];
const EXPORTED_MODULES = [CountdownTimeModule];

@NgModule({
    declarations: [...DECLARATIONS, ProjectorClockComponent, SlideContainerComponent],
    exports: [...DECLARATIONS, ...EXPORTED_MODULES],
    imports: [CommonModule, MatIconModule, DirectivesModule, SlidesModule]
})
export class ProjectorModule {}
