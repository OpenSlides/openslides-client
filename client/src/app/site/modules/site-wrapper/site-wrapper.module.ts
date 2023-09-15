import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { RouterModule } from '@angular/router';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { BannerComponent } from './components/banner/banner.component';
import { SiteWrapperComponent } from './components/site-wrapper/site-wrapper.component';
import { SiteWrapperServiceModule } from './services/site-wrapper-service.module';

@NgModule({
    declarations: [SiteWrapperComponent, BannerComponent],
    imports: [
        CommonModule,
        RouterModule,
        PortalModule,
        MatButtonModule,
        MatIconModule,
        SiteWrapperServiceModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class SiteWrapperModule {}
