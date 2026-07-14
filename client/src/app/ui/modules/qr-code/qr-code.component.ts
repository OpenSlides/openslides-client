import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import QRCode from 'qrcode';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

@Component({
    selector: `os-qr-code`,
    templateUrl: `./qr-code.component.html`,
    styleUrls: [`./qr-code.component.scss`]
})
export class QrCodeComponent implements AfterViewInit {
    @ViewChild(`qrCodeCanvas`)
    public canvas: ElementRef<HTMLCanvasElement>;

    @Input()
    public set text(text: string) {
        this._textSubject.next(text);
    }

    @Input()
    public edgeLength: number;

    private _textSubject = new BehaviorSubject<string>(``);

    public ngAfterViewInit(): void {
        this._textSubject.pipe(distinctUntilChanged()).subscribe(text => this.createCanvas(text));
    }

    private async createCanvas(text: string): Promise<void> {
        if (text) {
            QRCode.toCanvas(
                this.canvas.nativeElement,
                text,
                {
                    width: this.edgeLength
                },
                function (err) {
                    if (err) throw err;
                }
            );
        }
    }
}
