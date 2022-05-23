import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AgendaContentObjectFormModule } from './agenda-content-object-form/agenda-content-object-form.module';
import { DetailViewModule } from './detail-view/detail-view.module';
import { ProjectableListModule } from './projectable-list/projectable-list.module';
import { ProjectorButtonModule } from './projector-button/projector-button.module';
import { SpeakerButtonModule } from './speaker-button/speaker-button.module';

const MODULES = [
    DetailViewModule,
    ProjectableListModule,
    ProjectorButtonModule,
    SpeakerButtonModule,
    AgendaContentObjectFormModule
];

@NgModule({
    declarations: [],
    imports: [CommonModule, ...MODULES],
    exports: MODULES
})
export class MeetingsComponentCollectorModule {}
