import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollKeyVerbosePipe, PollParseNumberPipe, PollPercentBasePipe } from './pipes';
import { PollServiceModule } from './services/poll-service.module';
import { PollProgressComponent } from './components/poll-progress/poll-progress.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PollFormComponent } from './components/poll-form/poll-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { ChartComponent } from './components/chart/chart.component';
import { NgChartsModule } from 'ng2-charts';
import { CheckInputComponent } from './components/check-input/check-input.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EntitledUsersTableComponent } from './components/entitled-users-table/entitled-users-table.component';
import { ListModule } from 'src/app/ui/modules/list';
import { MatIconModule } from '@angular/material/icon';
import { VotingPrivacyDialogModule } from './modules/voting-privacy-dialog';
import { DirectivesModule } from 'src/app/ui/directives';

const MODULES = [PollServiceModule, VotingPrivacyDialogModule];
const PIPES = [PollKeyVerbosePipe, PollPercentBasePipe, PollParseNumberPipe];
const COMPONENTS = [
    PollProgressComponent,
    PollFormComponent,
    ChartComponent,
    CheckInputComponent,
    EntitledUsersTableComponent
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
        ReactiveFormsModule,
        FormsModule,
        VotingPrivacyDialogModule,
        ListModule,
        DirectivesModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild()
    ],
    exports: [...PIPES, ...MODULES, ...COMPONENTS],
    providers: PIPES
})
export class PollModule {}
