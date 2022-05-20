import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { DirectivesModule } from 'src/app/ui/directives';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { PipesModule } from 'src/app/ui/pipes';

import { MotionPollComponent } from './components/motion-poll/motion-poll.component';
import { MotionPollDetailContentComponent } from './components/motion-poll-detail-content/motion-poll-detail-content.component';
import { MotionPollDialogComponent } from './components/motion-poll-dialog/motion-poll-dialog.component';
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
    declarations: [MotionPollDialogComponent, ...DECLARATIONS],
    providers: [{ provide: PollService, useClass: MotionPollService }]
})
export class MotionPollModule {
    public static getComponent(): typeof MotionPollDialogComponent {
        return MotionPollDialogComponent;
    }
}
