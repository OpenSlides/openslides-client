import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandableContentWrapperComponent } from './expandable-content-wrapper.component';

xdescribe(`ExpandableContentWrapperComponent`, () => {
    let component: ExpandableContentWrapperComponent;
    let fixture: ComponentFixture<ExpandableContentWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ExpandableContentWrapperComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ExpandableContentWrapperComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
