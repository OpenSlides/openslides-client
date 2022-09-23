import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignMainComponent } from './design-main.component';

xdescribe(`DesignMainComponent`, () => {
    let component: DesignMainComponent;
    let fixture: ComponentFixture<DesignMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DesignMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DesignMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
