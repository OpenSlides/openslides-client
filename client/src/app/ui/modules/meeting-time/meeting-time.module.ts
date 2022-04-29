import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingTimeComponent } from './components/meeting-time/meeting-time.component';
import { PipesModule } from '../../pipes/pipes.module';

const DECLARATIONS = [MeetingTimeComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, PipesModule]
})
export class MeetingTimeModule {}
