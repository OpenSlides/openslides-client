import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { MediaUploadComponent } from './components/media-upload/media-upload.component';
import { MediafileListComponent } from './components/mediafile-list/mediafile-list.component';
import { MediafilesRoutingModule } from './mediafiles-routing.module';

@NgModule({
    imports: [CommonModule, MediafilesRoutingModule, SharedModule],
    declarations: [MediafileListComponent, MediaUploadComponent]
})
export class MediafilesModule {}
