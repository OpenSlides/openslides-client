import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { DirectivesModule } from 'src/app/ui/directives';
import { CommaSeparatedListingModule } from 'src/app/ui/modules/comma-separated-listing';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes';

import { MotionPollComponent } from './components/motion-poll/motion-poll.component';
import { MotionPollDetailContentComponent } from './components/motion-poll-detail-content/motion-poll-detail-content.component';
import { MotionPollDialogComponent } from './components/motion-poll-dialog/motion-poll-dialog.component';
import { MotionPollFormComponent } from './components/motion-poll-form/motion-poll-form.component';
import { MotionPollMetaInformationComponent } from './components/motion-poll-meta-information/motion-poll-meta-information.component';
import { MotionPollVoteComponent } from './components/motion-poll-vote/motion-poll-vote.component';
import { MotionPollService } from './services';
import { MotionPollServiceModule } from './services/motion-poll-service.module';

const DECLARATIONS = [
    MotionPollComponent,
    MotionPollMetaInformationComponent,
    MotionPollDetailContentComponent,
    MotionPollVoteComponent // TODO: Only exported to have access to it in the autopilot
];
const MODULES = [MotionPollServiceModule];

@NgModule({
    imports: [
        ...MODULES,
        CommonModule,
        CommaSeparatedListingModule,
        RouterModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDividerModule,
        MatTooltipModule,
        MatMenuModule,
        MatIconModule,
        MatCardModule,
        MatFormFieldModule,
        MatDialogModule,
        MatSelectModule,
        MatInputModule,
        MatRadioModule,
        SearchSelectorModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        FormsModule,
        PipesModule,
        DirectivesModule,
        PollModule,
        MeetingsComponentCollectorModule,
        OpenSlidesTranslationModule.forChild(),
        IconContainerModule
    ],
    exports: [...MODULES, ...DECLARATIONS, PollModule],
    declarations: [MotionPollDialogComponent, MotionPollFormComponent, ...DECLARATIONS],
    providers: [{ provide: PollService, useClass: MotionPollService }]
})
export class MotionPollModule {
    public static getComponent(): typeof MotionPollDialogComponent {
        return MotionPollDialogComponent;
    }
}
