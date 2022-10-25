import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
import { CheckVoteValidityDialogComponent } from './components/check-vote-validity-dialog/check-vote-validity-dialog.component';
import { EntitledUsersTableComponent } from './components/entitled-users-table/entitled-users-table.component';
import { PollNonVerificationContentComponent } from './components/poll-non-verification-content/poll-non-verification-content.component';
import { PollProgressComponent } from './components/poll-progress/poll-progress.component';
import { SingleOptionChartTableComponent } from './components/single-option-chart-table/single-option-chart-table.component';
import { VoteTokenDialogComponent } from './components/vote-token-dialog/vote-token-dialog.component';
import { VoteTokenSecretFieldComponent } from './components/vote-token-secret-field/vote-token-secret-field.component';
import { VotesTableComponent } from './components/votes-table/votes-table.component';
import { VotingCryptographyInfoDialogModule } from './modules/voting-cryptography-info-dialog';
import { VotingPrivacyDialogModule } from './modules/voting-privacy-dialog';
import { PollKeyVerbosePipe, PollParseNumberPipe, PollPercentBasePipe } from './pipes';
import { PollServiceModule } from './services/poll-service.module';

const MODULES = [PollServiceModule, VotingPrivacyDialogModule, VotingCryptographyInfoDialogModule];
const PIPES = [PollKeyVerbosePipe, PollPercentBasePipe, PollParseNumberPipe];
const COMPONENTS = [
    PollProgressComponent,
    ChartComponent,
    CheckInputComponent,
    EntitledUsersTableComponent,
    SingleOptionChartTableComponent,
    VotesTableComponent,
    VoteTokenDialogComponent,
    CheckVoteValidityDialogComponent,
    VoteTokenSecretFieldComponent,
    PollNonVerificationContentComponent
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
        MatDialogModule,
        MatButtonModule,
        MatTooltipModule,
        ReactiveFormsModule,
        IconContainerModule,
        FormsModule,
        VotingPrivacyDialogModule,
        VotingCryptographyInfoDialogModule,
        ListModule,
        DirectivesModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild()
    ],
    exports: [...PIPES, ...MODULES, ...COMPONENTS],
    providers: PIPES
})
export class PollModule {}
