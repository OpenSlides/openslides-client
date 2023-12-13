import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { UserComponentsModule } from 'src/app/site/modules/user-components';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { PipesModule } from 'src/app/ui/pipes';

import { CommitteeCommonServiceModule } from '../../../committees/services/committee-common-service.module';
import { AccountCommonServiceModule } from '../../services/common/account-common-service.module';
import { AccountDetailRoutingModule } from './account-detail-routing.module';
import { AccountAddToMeetingsComponent } from './components/account-add-to-meetings/account-add-to-meetings.component';
import { AccountDetailComponent } from './components/account-detail/account-detail.component';
import { AccountDetailMainComponent } from './components/account-detail-main/account-detail-main.component';
import { AccountPasswordComponent } from './components/account-password/account-password.component';

@NgModule({
    declarations: [
        AccountDetailComponent,
        AccountPasswordComponent,
        AccountDetailMainComponent,
        AccountAddToMeetingsComponent
    ],
    imports: [
        CommonModule,
        AccountDetailRoutingModule,
        AccountCommonServiceModule,
        CommitteeCommonServiceModule,
        MatIconModule,
        MatTooltipModule,
        MatMenuModule,
        MatFormFieldModule,
        MatDividerModule,
        MatCardModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        PromptDialogModule,
        HeadBarModule,
        DirectivesModule,
        UserComponentsModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild(),
        PipesModule
    ]
})
export class AccountDetailModule {}
