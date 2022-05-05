import { Component, OnInit } from '@angular/core';
import { EasterEggContentPlatformService } from '../../modules/easter-egg/services/easter-egg-content-platform.service';

@Component({
    selector: 'os-copyright-sign',
    templateUrl: './copyright-sign.component.html',
    styleUrls: ['./copyright-sign.component.scss']
})
export class CopyrightSignComponent {
    private clickTimeout: number | null = null;
    private clickCounter = 0;

    public constructor(private dialog: EasterEggContentPlatformService) {}

    public launchC4(event: Event): void {
        event.stopPropagation();
        event.preventDefault();

        this.clickCounter++;
        if (this.clickTimeout) {
            clearTimeout(<any>this.clickTimeout);
        }

        if (this.clickCounter === 5) {
            this.clickCounter = 0;
            this.dialog.open();
        } else {
            this.clickTimeout = <any>setTimeout(() => {
                this.clickCounter = 0;
            }, 200);
        }
    }
}
