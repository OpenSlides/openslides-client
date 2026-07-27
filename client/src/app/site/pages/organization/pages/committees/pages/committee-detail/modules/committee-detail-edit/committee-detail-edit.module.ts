import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { AccountSearchSelectorModule } from '@app/site/pages/organization/modules/account-search-selector';
import { DirectivesModule } from '@app/ui/directives';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { SearchSelectorModule } from '@app/ui/modules/search-selector';

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
        DirectivesModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class CommitteeDetailEditModule {}
