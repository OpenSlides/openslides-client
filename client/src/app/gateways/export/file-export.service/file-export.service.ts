import { inject, Service } from '@angular/core';
import { HttpService } from '@app/gateways/http.service';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

@Service()
export class FileExportService {
    private http = inject(HttpService);

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
        saveAs(archive, `${filename.replace(`/`, `:`)}.zip`);
    }
}
