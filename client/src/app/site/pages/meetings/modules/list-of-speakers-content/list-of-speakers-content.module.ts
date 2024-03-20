import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { SpeakingTimesComponent } from 'src/app/site/pages/meetings/modules/list-of-speakers-content/components/speaking-times/speaking-times.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { EditorModule } from 'src/app/ui/modules/editor';
import { SortingListModule } from 'src/app/ui/modules/sorting/modules/sorting-list/sorting-list.module';
import { PipesModule } from 'src/app/ui/pipes';

import { ParticipantCommonServiceModule } from '../../pages/participants/services/common/participant-common-service.module';
import { DetailViewModule } from '../meetings-component-collector/detail-view/detail-view.module';
import { ProjectorButtonModule } from '../meetings-component-collector/projector-button/projector-button.module';
import { ParticipantSearchSelectorModule } from '../participant-search-selector';
import { CountdownTimeModule } from '../projector/modules/countdown-time/countdown-time.module';
import { ListOfSpeakersContentComponent } from './components/list-of-speakers-content/list-of-speakers-content.component';
import { ListOfSpeakersEntryComponent } from './components/list-of-spekaers-entry/list-of-speakers-entry.component';
import { ModerationNoteComponent } from './components/moderation-note/moderation-note.component';
import { ListOfSpeakersContentTitleDirective } from './directives/list-of-speakers-content-title.directive';
import { PointOfOrderDialogModule } from './modules/point-of-order-dialog/point-of-order-dialog.module';
import { SpeakerUserSelectDialogModule } from './modules/speaker-user-select-dialog/speaker-user-select-dialog.module';

const DECLARATIONS = [
    ListOfSpeakersEntryComponent,
    ListOfSpeakersContentComponent,
    ListOfSpeakersContentTitleDirective,
    SpeakingTimesComponent,
    ModerationNoteComponent
];

@NgModule({
    exports: DECLARATIONS,
    declarations: DECLARATIONS,
    imports: [
        CommonModule,
        DetailViewModule,
        MatIconModule,
        MatExpansionModule,
        MatListModule,
        MatCardModule,
        MatDialogModule,
        MatTooltipModule,
        MatMenuModule,
        MatFormFieldModule,
        MatButtonModule,
        MatTableModule,
        MatInputModule,
        ReactiveFormsModule,
        SortingListModule,
        EditorModule,
        ParticipantSearchSelectorModule,
        ParticipantCommonServiceModule,
        PointOfOrderDialogModule,
        SpeakerUserSelectDialogModule,
        ProjectorButtonModule,
        CountdownTimeModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild(),
        PipesModule
    ]
})
export class ListOfSpeakersContentModule {}
