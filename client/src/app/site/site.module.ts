import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SiteRoutingModule } from './site-routing.module';
import { SiteWrapperModule } from './modules/site-wrapper/site-wrapper.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, SiteRoutingModule, SiteWrapperModule]
})
export class SiteModule {}
