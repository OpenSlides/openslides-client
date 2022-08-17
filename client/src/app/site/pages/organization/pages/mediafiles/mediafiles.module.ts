import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MediafilesRoutingModule } from './mediafiles-routing.module';
import { OrganizationMediafileMainComponent } from './components/organization-mediafile-main/organization-mediafile-main.component';


@NgModule({
    imports: [CommonModule, MediafilesRoutingModule],
    declarations: [
      OrganizationMediafileMainComponent
    ]
})
export class MediafilesModule { }
