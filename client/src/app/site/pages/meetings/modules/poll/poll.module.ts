import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { DirectivesModule } from '@app/ui/directives';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { ListModule } from '@app/ui/modules/list';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';

import { ChartComponent } from './components/chart/chart.component';
import { CheckInputComponent } from './components/check-input/check-input.component';
import { EntitledUsersTableComponent } from './components/entitled-users-table/entitled-users-table.component';
import { PollCannotVoteMessageComponent } from './components/poll-cannot-vote-message/poll-cannot-vote-message.component';
import { PollFilteredVotesChartComponent } from './components/poll-filtered-votes-chart/poll-filtered-votes-chart.component';
import { PollProgressComponent } from './components/poll-progress/poll-progress.component';
import { PollKeyVerbosePipe, PollParseNumberPipe } from './pipes';

const PIPES = [PollKeyVerbosePipe, PollParseNumberPipe];
const COMPONENTS = [PollFilteredVotesChartComponent, CheckInputComponent, EntitledUsersTableComponent];

@NgModule({
    declarations: [...COMPONENTS],
    imports: [
        CommonModule,
        ChartComponent,
        PollCannotVoteMessageComponent,
        PollProgressComponent,
        MatProgressBarModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatIconModule,
        MatCheckboxModule,
        MatDividerModule,
        MatRadioModule,
        ReactiveFormsModule,
        MatTooltipModule,
        IconContainerComponent,
        FormsModule,
        ListModule,
        DirectivesModule,
        SearchSelectorModule,
        MatProgressSpinnerModule,
        ...PIPES,
        OpenSlidesTranslationModule.forChild()
    ],
    exports: [...PIPES, ...COMPONENTS, ChartComponent, PollCannotVoteMessageComponent, PollProgressComponent],
    providers: [...PIPES]
})
export class PollModule {}
