import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommitteeDetailEditRoutingModule } from './committee-detail-edit-routing.module';
import { CommitteeDetailEditComponent } from './components/committee-detail-edit/committee-detail-edit.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';
import { OrganizationTagCommonServiceModule } from '../../../../../organization-tags/services/organization-tag-common-service.module';
import { AccountSearchSelectorModule } from 'src/app/site/pages/organization/modules/account-search-selector';

@NgModule({
    declarations: [CommitteeDetailEditComponent],
    imports: [
        CommonModule,
        CommitteeDetailEditRoutingModule,
        OrganizationTagCommonServiceModule,
        AccountSearchSelectorModule,
        HeadBarModule,
        MatCardModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        MatInputModule,
        SearchSelectorModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class CommitteeDetailEditModule {}
