import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { DirectivesModule } from '@app/ui/directives';
import { ChipComponent } from '@app/ui/modules/chip';
import { HeadBarModule } from '@app/ui/modules/head-bar';
import { ListModule } from '@app/ui/modules/list';

import { OrganizationTagsRoutingModule } from './organization-tags-routing.module';
import { OrganizationTagMainModule } from './pages/organization-tag-main/organization-tag-main.module';
import { OrganizationTagCommonServiceModule } from './services/organization-tag-common-service.module';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        OrganizationTagsRoutingModule,
        OrganizationTagCommonServiceModule,
        OrganizationTagMainModule,
        MatDialogModule,
        MatFormFieldModule,
        MatTooltipModule,
        ReactiveFormsModule,
        FormsModule,
        DirectivesModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        ChipComponent,
        HeadBarModule,
        ListModule,
        MatMenuModule,
        MatDividerModule
    ]
})
export class OrganizationTagsModule {}
