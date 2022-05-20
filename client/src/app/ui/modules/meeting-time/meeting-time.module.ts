import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PipesModule } from '../../pipes/pipes.module';
import { MeetingTimeComponent } from './components/meeting-time/meeting-time.component';

const DECLARATIONS = [MeetingTimeComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, PipesModule]
})
export class MeetingTimeModule {}
