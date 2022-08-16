import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { FilterMenuComponent } from './filter-menu.component';

xdescribe(`FilterMenuComponent`, () => {
    class TestBaseViewModel extends BaseViewModel {}

    let component: FilterMenuComponent<TestBaseViewModel>;
    let fixture: ComponentFixture<FilterMenuComponent<any>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FilterMenuComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
