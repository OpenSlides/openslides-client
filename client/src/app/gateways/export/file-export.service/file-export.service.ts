import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';
import { HttpService } from 'src/app/gateways/http.service';

import { ExportServiceModule } from '../export-service.module';

@Injectable({
    providedIn: ExportServiceModule
})
export class FileExportService {
    public constructor(private http: HttpService) {}

    /**
     * Saves a file
     * @param file
     * @param filename
     * @param mimeType an optional mime type
     */
    public saveFile(file: BlobPart, filename: string, mimeType?: string): void {
        const options: BlobPropertyBag = {};
        if (mimeType) {
            options.type = mimeType;
        }
        const blob = new Blob([file], options);
        saveAs(blob, filename, { autoBom: true });
        // autoBom = automatic byte-order-mark
    }

    /**
     * @deprecated This is maybe too specific
     *
     * @param filename
     * @param createContentFn
     */
    public async saveFileZip(filename: string, createContentFn: (zip: JSZip) => Promise<void>): Promise<void> {
        const zip = new JSZip();
        await createContentFn(zip);
        const archive = await zip.generateAsync({ type: `blob` });
        saveAs(archive, `${filename}.zip`);
    }
}
