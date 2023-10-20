import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
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
