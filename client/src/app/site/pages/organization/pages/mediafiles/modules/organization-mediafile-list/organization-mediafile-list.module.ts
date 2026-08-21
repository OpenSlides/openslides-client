import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from '@app/site/modules/translations';
import { MediafileListServiceModule } from '@app/site/pages/meetings/pages/mediafiles/modules/mediafile-list/services/mediafile-list-service.module';
import { MediafileCommonServiceModule } from '@app/site/pages/meetings/pages/mediafiles/services/mediafile-common-service.module';
import { DirectivesModule } from '@app/ui/directives';
import { FileListComponent } from '@app/ui/modules/file-list/file-list.component';
import { HeadBarModule } from '@app/ui/modules/head-bar';

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
        FileListComponent,
        MatDividerModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDialogModule,
        MatInputModule,
        OrganizationMediafileListRoutingModule,
        MediafileCommonServiceModule,
        MediafileListServiceModule,
        DirectivesModule,
        MatTooltipModule
    ]
})
export class OrganizationMediafileListModule {}
