import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionImportListComponent } from './motion-import-list.component';

xdescribe(`MotionImportListComponent`, () => {
    let component: MotionImportListComponent;
    let fixture: ComponentFixture<MotionImportListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionImportListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionImportListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
