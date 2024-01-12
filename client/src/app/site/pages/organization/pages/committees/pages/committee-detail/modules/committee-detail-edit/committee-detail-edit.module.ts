import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { AccountSearchSelectorModule } from 'src/app/site/pages/organization/modules/account-search-selector';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { SearchSelectorModule } from 'src/app/ui/modules/search-selector';

import { OrganizationTagCommonServiceModule } from '../../../../../organization-tags/services/organization-tag-common-service.module';
import { CommitteeDetailEditRoutingModule } from './committee-detail-edit-routing.module';
import { CommitteeDetailEditComponent } from './components/committee-detail-edit/committee-detail-edit.component';

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
