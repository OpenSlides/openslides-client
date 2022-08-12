import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SortBottomSheetComponent } from './sort-bottom-sheet.component';

xdescribe(`SortBottomSheetComponent`, () => {
    let fixture: ComponentFixture<SortBottomSheetComponent<any>>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({}).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SortBottomSheetComponent);
        // component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // it('should create', () => {
    //    expect(component).toBeTruthy();
    // });
});
