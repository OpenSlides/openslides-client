import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MediafileCommonServiceModule } from 'src/app/site/pages/meetings/pages/mediafiles/services/mediafile-common-service.module';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { MediaUploadContentModule } from 'src/app/ui/modules/media-upload-content/media-upload-content.module';

import { OrganizationMediafileUploadComponent } from './components/organization-mediafile-upload/organization-mediafile-upload.component';
import { OrganizationMediafileUploadRoutingModule } from './organization-mediafile-upload-routing.module';

@NgModule({
    declarations: [OrganizationMediafileUploadComponent],
    imports: [
        CommonModule,
        OrganizationMediafileUploadRoutingModule,
        OpenSlidesTranslationModule.forChild(),
        MatIconModule,
        MatMenuModule,
        MediaUploadContentModule,
        MatCardModule,
        HeadBarModule,
        MediafileCommonServiceModule
    ]
})
export class OrganizationMediafileUploadModule {}
