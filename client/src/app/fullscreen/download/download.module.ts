import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { DownloadRoutingModule } from './download-routing.module';
import { DownloadComponent } from './modules/download/download.component';

@NgModule({
    imports: [DownloadRoutingModule, SharedModule, CommonModule],
    declarations: [DownloadComponent]
})
export class DownloadModule {}
