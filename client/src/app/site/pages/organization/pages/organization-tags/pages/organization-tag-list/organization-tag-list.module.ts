import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { ChipModule } from 'src/app/ui/modules/chip';
import { HeadBarModule } from 'src/app/ui/modules/head-bar/head-bar.module';
import { ListModule } from 'src/app/ui/modules/list';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

import { OrganizationTagDialogModule } from '../../modules/organization-tag-dialog/organization-tag-dialog.module';
import { OrganizationTagListComponent } from './components/organization-tag-list/organization-tag-list.component';
import { OrganizationTagListRoutingModule } from './organization-tag-list-routing.module';

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
