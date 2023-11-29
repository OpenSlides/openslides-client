import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { FileExportService } from 'src/app/gateways/export/file-export.service/file-export.service';
import { HttpService } from 'src/app/gateways/http.service';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';

import { MediafileListServiceModule } from '../mediafile-list-service.module';

@Injectable({
    providedIn: MediafileListServiceModule
})
export class MediafileListExportService {
    public constructor(private exporter: FileExportService, private http: HttpService) {}

    public downloadArchive(filename: string, mediafiles: ViewMediafile[]): Promise<void> {
        return this.exporter.saveFileZip(filename, async zip => await this.addFileToZip(mediafiles, zip));
    }

    private async addFileToZip(mediafiles: ViewMediafile[], zip: JSZip): Promise<void> {
        for (const mediafile of mediafiles) {
            if (!mediafile.is_directory) {
                const download = await this.http.downloadAsBase64(mediafile.url);
                zip.file(mediafile.title, download.data, { base64: true });
            } else {
                const folder = zip.folder(mediafile.title);
                await this.addFileToZip(mediafile.children, folder);
            }
        }
    }
}
