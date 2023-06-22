import { Component } from '@angular/core';

import { BaseSlideComponent } from '../../../../base/base-slide-component';
import { WifiAccessDataSlideData } from '../../wifi-access-data-slide-data';

@Component({
    selector: `os-wifi-access-data-slide`,
    templateUrl: `./wifi-access-data-slide.component.html`,
    styleUrls: [`./wifi-access-data-slide.component.scss`]
})
export class WifiAccessDataSlideComponent extends BaseSlideComponent<WifiAccessDataSlideData> {
    public get ssid(): string {
        return this.data.data.users_pdf_wlan_ssid;
    }

    public get password(): string {
        return this.data.data.users_pdf_wlan_password;
    }

    public get encryption(): string {
        switch (this.data.data.users_pdf_wlan_encryption) {
            case `WEP`:
                return `WEP`;
            case `WPA`:
                return `WPA/WPA2`;
            case `nopass`:
                return `No encryption`;
            default:
                return undefined;
        }
    }
}
