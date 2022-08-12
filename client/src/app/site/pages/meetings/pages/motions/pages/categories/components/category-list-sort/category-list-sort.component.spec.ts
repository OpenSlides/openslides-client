import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryListSortComponent } from './category-list-sort.component';

xdescribe(`CategoryListSortComponent`, () => {
    let component: CategoryListSortComponent;
    let fixture: ComponentFixture<CategoryListSortComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CategoryListSortComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CategoryListSortComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
