import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingListComponent } from './sorting-list.component';

xdescribe(`SortingListComponent`, () => {
    let component: SortingListComponent;
    let fixture: ComponentFixture<SortingListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SortingListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SortingListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
