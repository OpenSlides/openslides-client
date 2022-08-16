import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalTabGroupComponent } from './vertical-tab-group.component';

xdescribe(`VerticalTabGroupComponent`, () => {
    let component: VerticalTabGroupComponent;
    let fixture: ComponentFixture<VerticalTabGroupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VerticalTabGroupComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VerticalTabGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
