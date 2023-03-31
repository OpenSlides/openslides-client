import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgaMeetingsMainComponent } from './orga-meetings-main.component';

xdescribe(`OrgaMeetingsMainComponent`, () => {
    let component: OrgaMeetingsMainComponent;
    let fixture: ComponentFixture<OrgaMeetingsMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrgaMeetingsMainComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(OrgaMeetingsMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
