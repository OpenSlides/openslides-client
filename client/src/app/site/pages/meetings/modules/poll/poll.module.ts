import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgChartsModule } from 'ng2-charts';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { IconContainerModule } from 'src/app/ui/modules/icon-container';
import { ListModule } from 'src/app/ui/modules/list';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { ChartComponent } from './components/chart/chart.component';
import { CheckInputComponent } from './components/check-input/check-input.component';
import { EntitledUsersTableComponent } from './components/entitled-users-table/entitled-users-table.component';
import { PollCannotVoteMessageComponent } from './components/poll-cannot-vote-message/poll-cannot-vote-message.component';
import { PollProgressComponent } from './components/poll-progress/poll-progress.component';
import { SingleOptionChartTableComponent } from './components/single-option-chart-table/single-option-chart-table.component';
import { VotesTableComponent } from './components/votes-table/votes-table.component';
import { VotingPrivacyDialogModule } from './modules/voting-privacy-dialog';
import { PollKeyVerbosePipe, PollParseNumberPipe, PollPercentBasePipe } from './pipes';
import { PollServiceModule } from './services/poll-service.module';

const MODULES = [PollServiceModule, VotingPrivacyDialogModule];
const PIPES = [PollKeyVerbosePipe, PollPercentBasePipe, PollParseNumberPipe];
const COMPONENTS = [
    PollProgressComponent,
    ChartComponent,
    CheckInputComponent,
    EntitledUsersTableComponent,
    SingleOptionChartTableComponent,
    VotesTableComponent,
    PollCannotVoteMessageComponent
];

@NgModule({
    declarations: [...PIPES, ...COMPONENTS],
    imports: [
        CommonModule,
        NgChartsModule,
        MatProgressBarModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatIconModule,
        MatCheckboxModule,
        MatRadioModule,
        ReactiveFormsModule,
        MatTooltipModule,
        IconContainerModule,
        FormsModule,
        VotingPrivacyDialogModule,
        ListModule,
        DirectivesModule,
        SearchSelectorModule,
        MatProgressSpinnerModule,
        OpenSlidesTranslationModule.forChild()
    ],
    exports: [...PIPES, ...MODULES, ...COMPONENTS],
    providers: PIPES
})
export class PollModule {}
