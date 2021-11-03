import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgaSettingsComponent } from './orga-settings.component';

describe(`OrgaSettingsComponent`, () => {
    let component: OrgaSettingsComponent;
    let fixture: ComponentFixture<OrgaSettingsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrgaSettingsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrgaSettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
