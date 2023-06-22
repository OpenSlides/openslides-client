import { Component, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlideData } from 'src/app/site/pages/meetings/pages/projectors/definitions';

import { WifiAccessDataSlideComponent } from './wifi-access-data-slide.component';

@Pipe({
    name: `translate`,
    pure: false
})
export class MockTranslatePipe implements PipeTransform {
    public transform(text: string): string {
        return text;
    }
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

fdescribe(`WifiAccessDataSlideComponent`, () => {
    let testBed: TestBed;
    let component: WifiAccessDataSlideComponent;
    let testComponent: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(() => {
        testBed = TestBed.configureTestingModule({
            declarations: [WifiAccessDataSlideComponent, TestComponent, MockTranslatePipe]
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
    });

    it(`should have correct data for WEP`, () => {
        testComponent.type = `fullDataWEP`;
        fixture.detectChanges();
        expect(component.ssid).toBe(`RandomWiWi`);
        expect(component.password).toBe(`Super&StrongP455Word`);
        expect(component.encryption).toBe(`WEP`);
    });

    it(`should have correct data for encryption = nopass`, () => {
        testComponent.type = `fullDataNopass`;
        fixture.detectChanges();
        expect(component.ssid).toBe(`RandomWiWi`);
        expect(component.password).toBe(`Super&StrongP455Word`);
        expect(component.encryption).toBe(`No encryption`);
    });

    it(`should have correct data for no data`, () => {
        testComponent.type = `noData`;
        fixture.detectChanges();
        expect(component.ssid).toBe(undefined);
        expect(component.password).toBe(undefined);
        expect(component.encryption).toBe(undefined);
    });
});
