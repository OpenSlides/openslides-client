import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MediafileMainComponent } from './components/mediafile-main/mediafile-main.component';
import { MediafilesRoutingModule } from './mediafiles-routing.module';
import { MediafileCommonServiceModule } from './services/mediafile-common-service.module';

@NgModule({
    declarations: [MediafileMainComponent],
    imports: [CommonModule, MediafilesRoutingModule, MediafileCommonServiceModule, RouterModule]
})
export class MediafilesModule {}
