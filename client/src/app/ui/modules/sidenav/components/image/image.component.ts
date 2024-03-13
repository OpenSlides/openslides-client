import { Component, Input } from '@angular/core';
import { HttpService } from 'src/app/gateways/http.service';

@Component({
    selector: `os-image`,
    templateUrl: `./image.component.html`,
    styleUrls: [`./image.component.scss`]
})
export class ImageComponent {
    @Input()
    public set source(src: string | null) {
        if (this._source !== src) {
            this._source = src;
            this.onChange();
        }
    }

    public get source(): string | null {
        return this._source;
    }

    public get progress(): number {
        return this.totalBytesToLoad === 0 ? 0 : Math.round((this.bytesLoaded * 100) / this.totalBytesToLoad);
    }

    public resource: any;

    public resourceType = ``;

    public loaded = false;

    private bytesLoaded = 0;

    private totalBytesToLoad = 0;

    private _source: string | null = null;

    public constructor(private http: HttpService) {} // Maybe the wrong place here!

    private onChange(): void {
        this.loaded = false;
        this.startLoading();
    }

    private addListenersToReader(fileReader: FileReader): void {
        fileReader.onprogress = event => this.handleReaderEvent(event, fileReader);
        fileReader.onload = event => this.handleReaderEvent(event, fileReader);
    }

    private startLoading(): void {
        if (!this.loaded && this._source) {
            this.loadResource();
        }
    }

    private loadResource(): void {
        this.http.get<Blob>(this._source!, null, { responseType: `blob` }).then(response => {
            this.readBlobData(response);
        });
    }

    private readBlobData(data: Blob): void {
        const fileReader = new FileReader();
        this.addListenersToReader(fileReader);
        this.bytesLoaded = 0;
        this.totalBytesToLoad = data.size;
        this.resourceType = data.type.split(`/`)[0];
        switch (this.resourceType) {
            case `image`:
                fileReader.readAsDataURL(data);
                break;
            default:
                throw new Error(`Only images are supported!`);
        }
    }

    private handleReaderEvent(event: ProgressEvent<FileReader>, fileReader: FileReader): void {
        this.bytesLoaded = event.loaded;
        if (event.type === `load`) {
            const result = fileReader.result;
            if (typeof result === `string`) {
                this.resource = result;
            } else if (result instanceof ArrayBuffer) {
                const buffer = new Uint8Array(result);
                this.resource = new TextDecoder().decode(buffer);
            }
            this.finishLoading();
        }
    }

    private finishLoading(): void {
        this.loaded = true;
    }
}
