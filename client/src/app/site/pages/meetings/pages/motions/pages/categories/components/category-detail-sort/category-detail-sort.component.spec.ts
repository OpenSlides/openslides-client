import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryDetailSortComponent } from './category-detail-sort.component';

xdescribe(`CategoryDetailSortComponent`, () => {
    let component: CategoryDetailSortComponent;
    let fixture: ComponentFixture<CategoryDetailSortComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CategoryDetailSortComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CategoryDetailSortComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
