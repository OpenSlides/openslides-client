import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { OrganizationMediafileMainComponent } from './components/organization-mediafile-main/organization-mediafile-main.component';
import { MediafilesRoutingModule } from './mediafiles-routing.module';

@NgModule({
    imports: [CommonModule, MediafilesRoutingModule],
    declarations: [OrganizationMediafileMainComponent]
})
export class MediafilesModule {}
