import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SiteWrapperModule } from './modules/site-wrapper/site-wrapper.module';
import { SiteRoutingModule } from './site-routing.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, SiteRoutingModule, SiteWrapperModule]
})
export class SiteModule {}
