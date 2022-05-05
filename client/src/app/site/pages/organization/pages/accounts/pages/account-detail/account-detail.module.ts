import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountDetailComponent } from './components/account-detail/account-detail.component';
import { AccountPasswordComponent } from './components/account-password/account-password.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { AccountDetailRoutingModule } from './account-detail-routing.module';
import { AccountCommonServiceModule } from '../../services/common/account-common-service.module';
import { CommitteeCommonServiceModule } from '../../../committees/services/committee-common-service.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { UserComponentsModule } from 'src/app/ui/modules/user-components';
import { AccountDetailMainComponent } from './components/account-detail-main/account-detail-main.component';

@NgModule({
    declarations: [AccountDetailComponent, AccountPasswordComponent, AccountDetailMainComponent],
    imports: [
        CommonModule,
        AccountDetailRoutingModule,
        AccountCommonServiceModule,
        CommitteeCommonServiceModule,
        MatIconModule,
        MatTooltipModule,
        MatMenuModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDividerModule,
        RouterModule,
        MatSelectModule,
        HeadBarModule,
        DirectivesModule,
        UserComponentsModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class AccountDetailModule {}
