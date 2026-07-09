import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SortBottomSheetComponent } from './sort-bottom-sheet.component';

describe.skip(`SortBottomSheetComponent`, () => {
    let component: SortBottomSheetComponent<any>;
    let fixture: ComponentFixture<SortBottomSheetComponent<any>>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({}).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SortBottomSheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
