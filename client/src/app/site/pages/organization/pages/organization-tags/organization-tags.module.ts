import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { DirectivesModule } from 'src/app/ui/directives';
import { ChipModule } from 'src/app/ui/modules/chip';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';

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
        ChipModule,
        HeadBarModule,
        ListModule,
        MatMenuModule,
        MatDividerModule
    ]
})
export class OrganizationTagsModule {}
