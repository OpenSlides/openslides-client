import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteWrapperComponent } from './components/site-wrapper/site-wrapper.component';
import { RouterModule } from '@angular/router';
import { BannerComponent } from './components/banner/banner.component';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
    declarations: [SiteWrapperComponent, BannerComponent],
    imports: [CommonModule, RouterModule, PortalModule, MatIconModule, OpenSlidesTranslationModule.forChild()]
})
export class SiteWrapperModule {}
