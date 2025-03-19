import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OriginMotionMetaDataComponent } from './origin-motion-meta-data.component';

xdescribe(`MotionMetaDataComponent`, () => {
    let component: OriginMotionMetaDataComponent;
    let fixture: ComponentFixture<OriginMotionMetaDataComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OriginMotionMetaDataComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OriginMotionMetaDataComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
