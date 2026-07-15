import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { DirectivesModule } from '@app/ui/directives';
import { ListModule } from '@app/ui/modules/list';

import { ProjectorButtonModule } from '../projector-button/projector-button.module';
import { SpeakerButtonModule } from '../speaker-button/speaker-button.module';
import { ProjectableListComponent } from './components/projectable-list/projectable-list.component';
import { ProjectableListService } from './services/projectable-list.service';

const DECLARATIONS = [ProjectableListComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: [...DECLARATIONS, ListModule],
    imports: [
        CommonModule,
        ListModule,
        ProjectorButtonModule,
        SpeakerButtonModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatTooltipModule
    ],
    providers: [ProjectableListService]
})
export class ProjectableListModule {}
