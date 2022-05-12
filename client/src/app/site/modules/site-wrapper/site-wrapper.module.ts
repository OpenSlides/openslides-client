import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteWrapperComponent } from './components/site-wrapper/site-wrapper.component';
import { RouterModule } from '@angular/router';
import { BannerComponent } from './components/banner/banner.component';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PortalModule } from '@angular/cdk/portal';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { SiteWrapperServiceModule } from './services/site-wrapper-service.module';

@NgModule({
    declarations: [SiteWrapperComponent, BannerComponent],
    imports: [
        CommonModule,
        RouterModule,
        PortalModule,
        MatIconModule,
        SiteWrapperServiceModule,
        ServiceWorkerModule.register(`ngsw-worker.js`, { enabled: environment.production }),
        OpenSlidesTranslationModule.forChild()
    ]
})
export class SiteWrapperModule {}
