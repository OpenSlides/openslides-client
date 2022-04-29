import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectableListComponent } from './components/projectable-list/projectable-list.component';
import { ListModule } from 'src/app/ui/modules/list';
import { ProjectorButtonModule } from '../projector-button/projector-button.module';
import { MatIconModule } from '@angular/material/icon';
import { SpeakerButtonModule } from '../speaker-button/speaker-button.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
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
