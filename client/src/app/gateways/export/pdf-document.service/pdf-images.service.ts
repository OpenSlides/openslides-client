import { Injectable } from '@angular/core';

const IMAGE_USABLE_FOR_PDF_MIMETYPES = [`image/png`, `image/jpeg`];

/**
 * This is a helper service that caches the URLs of the images in the attachment
 * so that they can be loaded into the virtual file system before PDF creation.
 */
@Injectable({
    providedIn: `root`
})
export class PdfImagesService {
    private imageUrls: string[] = [];

    public addImageUrl(imageUrl: string): void {
        this.imageUrls.push(imageUrl);
    }

    public getImageUrls(): string[] {
        return this.imageUrls;
    }

    public clearImageUrls(): void {
        this.imageUrls = [];
    }

    public isImageUsableForPdf(mimetype: string): boolean {
        return IMAGE_USABLE_FOR_PDF_MIMETYPES.includes(mimetype);
    }
}
