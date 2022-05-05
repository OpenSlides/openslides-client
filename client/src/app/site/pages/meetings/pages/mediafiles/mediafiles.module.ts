import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediafilesRoutingModule } from './mediafiles-routing.module';
import { MediafileMainComponent } from './components/mediafile-main/mediafile-main.component';
import { RouterModule } from '@angular/router';
import { MediafileCommonServiceModule } from './services/mediafile-common-service.module';

@NgModule({
    declarations: [MediafileMainComponent],
    imports: [CommonModule, MediafilesRoutingModule, MediafileCommonServiceModule, RouterModule]
})
export class MediafilesModule {}
