import { Component, OnInit } from '@angular/core';

import { BrowserRecommendation, BrowserSupportService } from '../../../../services/browser-support.service';

@Component({
    selector: `os-unsupported-browser`,
    templateUrl: `./unsupported-browser.component.html`,
    styleUrls: [`./unsupported-browser.component.scss`]
})
export class UnsupportedBrowserComponent implements OnInit {
    public supported = false;
    public currentBrowser = ``;
    public browserVersion = ``;
    public supportedVersion = 0;

    public get recommendedBrowsers(): BrowserRecommendation[] {
        return this.browserSupprt.recommendedBrowsers;
    }

    public constructor(private browserSupprt: BrowserSupportService) {}

    public ngOnInit(): void {
        const deviceInfo = this.browserSupprt.getDeviceInfo();
        this.supported = this.browserSupprt.isBrowserSupported();
        this.currentBrowser = deviceInfo.browser;
        this.browserVersion = deviceInfo.browser_version;
        this.supportedVersion = this.browserSupprt.getSupportedVersion(deviceInfo);
    }
}
