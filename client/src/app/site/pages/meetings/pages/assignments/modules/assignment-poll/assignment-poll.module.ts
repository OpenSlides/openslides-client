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
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MeetingsComponentCollectorModule } from 'src/app/site/pages/meetings/modules/meetings-component-collector';
import { PollModule } from 'src/app/site/pages/meetings/modules/poll';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChoiceDialogModule } from 'src/app/ui/modules/choice-dialog';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes';

import { AssignmentCommonServiceModule } from '../../services/assignment-common-service.module';
import { AssignmentPollComponent } from './components/assignment-poll/assignment-poll.component';
import { AssignmentPollDetailContentComponent } from './components/assignment-poll-detail-content/assignment-poll-detail-content.component';
import { AssignmentPollDialogComponent } from './components/assignment-poll-dialog/assignment-poll-dialog.component';
import { AssignmentPollFormComponent } from './components/assignment-poll-form/assignment-poll-form.component';
import { AssignmentPollMetaInfoComponent } from './components/assignment-poll-meta-info/assignment-poll-meta-info.component';
import { AssignmentPollVoteComponent } from './components/assignment-poll-vote/assignment-poll-vote.component';
import { AssignmentPollService } from './services/assignment-poll.service';
import { AssignmentPollServiceModule } from './services/assignment-poll-service.module';

const COMPONENTS = [
    AssignmentPollComponent,
    AssignmentPollDetailContentComponent,
    AssignmentPollMetaInfoComponent,
    AssignmentPollVoteComponent // TODO: Only exported to have access to it in the autopilot
];

@NgModule({
    declarations: [...COMPONENTS, AssignmentPollDialogComponent, AssignmentPollFormComponent],
    exports: [...COMPONENTS, PollModule, AssignmentPollServiceModule],
    imports: [
        CommonModule,
        AssignmentPollServiceModule,
        AssignmentCommonServiceModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatMenuModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule,
        MatSelectModule,
        MatButtonModule,
        MatInputModule,
        MatTooltipModule,
        SearchSelectorModule,
        PollModule,
        DirectivesModule,
        PipesModule,
        ChoiceDialogModule,
        MeetingsComponentCollectorModule,
        IconContainerModule,
        OpenSlidesTranslationModule.forChild()
    ],
    providers: [{ provide: PollService, useClass: AssignmentPollService }]
})
export class AssignmentPollModule {
    public static getComponent(): typeof AssignmentPollDialogComponent {
        return AssignmentPollDialogComponent;
    }
}
