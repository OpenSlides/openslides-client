import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationTagsRoutingModule } from './organization-tags-routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { DirectivesModule } from 'src/app/ui/directives';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ChipModule } from 'src/app/ui/modules/chip';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
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
