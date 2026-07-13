import { Injectable } from '@angular/core';
import { FileExportService } from '@app/gateways/export/file-export.service/file-export.service';
import { HttpService } from '@app/gateways/http.service';
import { ViewMediafile } from '@app/site/pages/meetings/pages/mediafiles';
import JSZip from 'jszip';

@Injectable({
    providedIn: 'root'
})
export class MediafileListExportService {
    public constructor(
        private exporter: FileExportService,
        private http: HttpService
    ) {}

    public downloadArchive(filename: string, mediafiles: ViewMediafile[]): Promise<void> {
        return this.exporter.saveFileZip(filename, async zip => await this.addFileToZip(mediafiles, zip));
    }

    private async addFileToZip(mediafiles: ViewMediafile[], zip: JSZip): Promise<void> {
        for (const mediafile of mediafiles) {
            if (!mediafile.is_directory) {
                const download = await this.http.downloadAsBase64(mediafile.url);
                zip.file(mediafile.title.replace(`/`, `:`), download.data, { base64: true });
            } else {
                const folder = zip.folder(mediafile.title.replace(`/`, `:`));
                await this.addFileToZip(mediafile.children, folder);
            }
        }
    }
}
