import { Injectable } from '@angular/core';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { FileExportService } from 'src/app/gateways/export/file-export.service/file-export.service';
import { MediafileListServiceModule } from '../mediafile-list-service.module';

@Injectable({
    providedIn: MediafileListServiceModule
})
export class MediafileListExportService {
    public constructor(private exporter: FileExportService) {}

    public downloadArchive(filename: string, mediafiles: ViewMediafile[]): Promise<void> {
        return this.exporter.saveFileZip(filename, async (zip, http) => {
            for (const mediafile of mediafiles) {
                if (!mediafile.is_directory) {
                    const base64Data = await http.downloadAsBase64(mediafile.url);
                    zip.file(mediafile.title, base64Data, { base64: true });
                }
            }
        });
    }
}
