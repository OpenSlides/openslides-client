import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryDetailComponent } from './category-detail.component';

xdescribe(`CategoryDetailComponent`, () => {
    let component: CategoryDetailComponent;
    let fixture: ComponentFixture<CategoryDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CategoryDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CategoryDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
