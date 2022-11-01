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
    public constructor(private exporter: FileExportService) {}

    public downloadArchive(filename: string, mediafiles: ViewMediafile[]): Promise<void> {
        return this.exporter.saveFileZip(filename, async (zip, http) => await this.addFileToZip(mediafiles, zip, http));
    }

    private async addFileToZip(mediafiles: ViewMediafile[], zip: JSZip, http: HttpService): Promise<void> {
        for (const mediafile of mediafiles) {
            if (!mediafile.is_directory) {
                const base64Data = await http.downloadAsBase64(mediafile.url);
                zip.file(mediafile.title, base64Data, { base64: true });
            }
        }
    }
}
