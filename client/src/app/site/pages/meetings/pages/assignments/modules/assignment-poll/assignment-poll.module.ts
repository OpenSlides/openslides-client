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
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { MeetingsComponentCollectorModule } from '@app/site/pages/meetings/modules/meetings-component-collector';
import { PollModule } from '@app/site/pages/meetings/modules/poll';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { DirectivesModule } from '@app/ui/directives';
import { ChoiceDialogComponent } from '@app/ui/modules/choice-dialog';
import { CommaSeparatedListingComponent } from '@app/ui/modules/comma-separated-listing';
import { CustomIconComponent } from '@app/ui/modules/custom-icon';
import { ArrowNavigationDirective } from '@app/ui/modules/editor/directives/tab-navigation.directive';
import { ExpandableContentWrapperComponent } from '@app/ui/modules/expandable-content-wrapper';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';
import { PipesModule } from '@app/ui/pipes';

import { AssignmentCommonServiceModule } from '../../services/assignment-common-service.module';
import { AssignmentPollComponent } from './components/assignment-poll/assignment-poll.component';
import { AssignmentPollDialogComponent } from './components/assignment-poll-dialog/assignment-poll-dialog.component';
import { AssignmentPollService } from './services/assignment-poll.service';
import { AssignmentPollServiceModule } from './services/assignment-poll-service.module';

@NgModule({
    declarations: [],
    exports: [PollModule, AssignmentPollServiceModule, AssignmentPollComponent],
    imports: [
        AssignmentPollComponent,
        AssignmentPollDialogComponent,
        ArrowNavigationDirective,
        CustomIconComponent,
        CommonModule,
        CommaSeparatedListingComponent,
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
        SearchSelectorModule,
        PollModule,
        DirectivesModule,
        PipesModule,
        ChoiceDialogComponent,
        MeetingsComponentCollectorModule,
        ExpandableContentWrapperComponent,
        IconContainerComponent,
        OpenSlidesTranslationModule.forChild()
    ],
    providers: [{ provide: PollService, useClass: AssignmentPollService }]
})
export class AssignmentPollModule {
    public static getComponent(): typeof AssignmentPollDialogComponent {
        return AssignmentPollDialogComponent;
    }
}
