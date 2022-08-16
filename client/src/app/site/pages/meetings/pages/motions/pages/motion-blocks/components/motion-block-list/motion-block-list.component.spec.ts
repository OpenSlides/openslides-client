import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionBlockListComponent } from './motion-block-list.component';

xdescribe(`MotionBlockListComponent`, () => {
    let component: MotionBlockListComponent;
    let fixture: ComponentFixture<MotionBlockListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionBlockListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionBlockListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
