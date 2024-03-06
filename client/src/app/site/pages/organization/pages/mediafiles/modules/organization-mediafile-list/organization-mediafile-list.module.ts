import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MediafileListServiceModule } from 'src/app/site/pages/meetings/pages/mediafiles/modules/mediafile-list/services/mediafile-list-service.module';
import { MediafileCommonServiceModule } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-common-service.module';
import { DirectivesModule } from 'src/app/ui/directives';
import { FileListModule } from 'src/app/ui/modules/file-list/file-list.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PromptDialogModule } from 'src/app/ui/modules/prompt-dialog';

import { OrganizationMediafileListComponent } from './components/organization-mediafile-list/organization-mediafile-list.component';
import { OrganizationMediafileListRoutingModule } from './organization-mediafile-list-routing.module';

@NgModule({
    declarations: [OrganizationMediafileListComponent],
    imports: [
        CommonModule,
        HeadBarModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatMenuModule,
        FileListModule,
        MatDividerModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDialogModule,
        MatInputModule,
        OrganizationMediafileListRoutingModule,
        MediafileCommonServiceModule,
        MediafileListServiceModule,
        PromptDialogModule,
        DirectivesModule,
        MatTooltipModule
    ]
})
export class OrganizationMediafileListModule {}
