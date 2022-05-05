import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationTagListRoutingModule } from './organization-tag-list-routing.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar/head-bar.module';
import { ListModule } from 'src/app/ui/modules/list';
import { ChipModule } from 'src/app/ui/modules/chip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { OrganizationTagListComponent } from './components/organization-tag-list/organization-tag-list.component';
import { OrganizationTagDialogModule } from '../../modules/organization-tag-dialog/organization-tag-dialog.module';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

@NgModule({
    declarations: [OrganizationTagListComponent],
    imports: [
        CommonModule,
        OrganizationTagListRoutingModule,
        OrganizationTagDialogModule,
        PromptDialogModule,
        HeadBarModule,
        ListModule,
        ChipModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatDividerModule
    ]
})
export class OrganizationTagListModule {}
