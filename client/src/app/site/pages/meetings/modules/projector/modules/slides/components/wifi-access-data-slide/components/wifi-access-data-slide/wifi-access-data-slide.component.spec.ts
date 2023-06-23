import { Component, DebugElement, Input, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';

import { WifiAccessDataSlideComponent } from './wifi-access-data-slide.component';

@Pipe({
    name: `translate`,
    pure: false
})
class MockTranslatePipe implements PipeTransform {
    public transform(text: string): string {
        return text;
    }
}

@Component({
    selector: `os-qr-code`,
    template: `
        {{ text }}
    `
})
class MockQrCodeComponent {
    @Input()
    public text: string;

    @Input()
    public edgeLength: number;
}

@Component({
    template: `
        <os-wifi-access-data-slide [data]="slideData">Or not to be</os-wifi-access-data-slide>
    `
})
class TestComponent {
    public get slideData(): SlideData<any> {
        return this._slideData[this.type];
    }

    public type: keyof typeof this._slideData = `fullDataWPA`;
    private readonly _slideData = {
        fullDataWPA: {
            collection: `wifi_access_data`,
            data: {
                collection: `wifi_access_data`,
                users_pdf_wlan_encryption: `WPA`,
                users_pdf_wlan_password: `Super&StrongP455Word`,
                users_pdf_wlan_ssid: `RandomWiWi`
            },
            stable: false,
            type: `wifi_access_data`,
            options: {}
        },
        fullDataWEP: {
            collection: `wifi_access_data`,
            data: {
                collection: `wifi_access_data`,
                users_pdf_wlan_encryption: `WEP`,
                users_pdf_wlan_password: `Super&StrongP455Word`,
                users_pdf_wlan_ssid: `RandomWiWi`
            },
            stable: false,
            type: `wifi_access_data`,
            options: {}
        },
        fullDataNopass: {
            collection: `wifi_access_data`,
            data: {
                collection: `wifi_access_data`,
                users_pdf_wlan_encryption: `nopass`,
                users_pdf_wlan_password: `Super&StrongP455Word`,
                users_pdf_wlan_ssid: `RandomWiWi`
            },
            stable: false,
            type: `wifi_access_data`,
            options: {}
        },
        noData: {
            collection: `wifi_access_data`,
            data: {},
            stable: false,
            type: `wifi_access_data`,
            options: {}
        }
    } as const;
}

/**
 * Finds the first sub-element that matches the path specified by nodenames
 * @param element the DebugElement whose children should be searched through
 * @param nodenames An array with the exact sequence of nodenames up to the sub-element. '.' symbols within strings will be interpreted as separators and the strings will be split.
 * @returns the first DebugElement that exactly fullfills the given path
 */
function findChildFromDebugElement(element: DebugElement, ...nodenames: string[]): DebugElement {
    if (!nodenames.length) {
        return element;
    }
    nodenames = [...nodenames[0].split(`.`), ...nodenames.slice(1)];
    const children = element.children?.filter(child => child.name === nodenames[0]) ?? [];
    for (let child of children) {
        const result = findChildFromDebugElement(child, ...nodenames.slice(1));
        if (result) {
            return result;
        }
    }
    return undefined;
}

const QR_COMPONENT_PATH = `os-wifi-access-data-slide.div.div.os-qr-code`;

describe(`WifiAccessDataSlideComponent`, () => {
    let testBed: TestBed;
    let component: WifiAccessDataSlideComponent;
    let testComponent: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
        testBed = TestBed.configureTestingModule({
            declarations: [WifiAccessDataSlideComponent, TestComponent, MockTranslatePipe, MockQrCodeComponent]
        });
        fixture = testBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        component = fixture.debugElement.childNodes[0].componentInstance;
        fixture.detectChanges();
    });

    it(`should have correct data for WPA`, () => {
        expect(component.ssid).toBe(`RandomWiWi`);
        expect(component.password).toBe(`Super&StrongP455Word`);
        expect(component.encryption).toBe(`WPA/WPA2`);
        let qr: MockQrCodeComponent = findChildFromDebugElement(
            fixture.debugElement,
            QR_COMPONENT_PATH
        )?.componentInstance;
        expect(qr).not.toBe(undefined);
        expect(qr.text).toBe(`WIFI:S:RandomWiWi;T:WPA;P:Super&StrongP455Word;;`);
        expect(qr.edgeLength).toBe(450);
    });

    it(`should have correct data for WEP`, () => {
        testComponent.type = `fullDataWEP`;
        fixture.detectChanges();
        expect(component.ssid).toBe(`RandomWiWi`);
        expect(component.password).toBe(`Super&StrongP455Word`);
        expect(component.encryption).toBe(`WEP`);
        let qr: MockQrCodeComponent = findChildFromDebugElement(
            fixture.debugElement,
            QR_COMPONENT_PATH
        )?.componentInstance;
        expect(qr).not.toBe(undefined);
        expect(qr.text).toBe(`WIFI:S:RandomWiWi;T:WEP;P:Super&StrongP455Word;;`);
        expect(qr.edgeLength).toBe(450);
    });

    it(`should have correct data for encryption = nopass`, () => {
        testComponent.type = `fullDataNopass`;
        fixture.detectChanges();
        expect(component.ssid).toBe(`RandomWiWi`);
        expect(component.password).toBe(`Super&StrongP455Word`);
        expect(component.encryption).toBe(`No encryption`);
        let qr: MockQrCodeComponent = findChildFromDebugElement(
            fixture.debugElement,
            QR_COMPONENT_PATH
        )?.componentInstance;
        expect(qr).not.toBe(undefined);
        expect(qr.text).toBe(`WIFI:S:RandomWiWi;T:nopass;P:Super&StrongP455Word;;`);
        expect(qr.edgeLength).toBe(450);
    });

    it(`should have correct data for no data`, () => {
        testComponent.type = `noData`;
        fixture.detectChanges();
        expect(component.ssid).toBe(undefined);
        expect(component.password).toBe(undefined);
        expect(component.encryption).toBe(undefined);
        let qr: MockQrCodeComponent = findChildFromDebugElement(
            fixture.debugElement,
            QR_COMPONENT_PATH
        )?.componentInstance;
        expect(qr).toBe(undefined);
    });
});
