import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSearchSelectorComponent } from './list-search-selector.component';

xdescribe(`ListSearchSelectorComponent`, () => {
    let component: ListSearchSelectorComponent;
    let fixture: ComponentFixture<ListSearchSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ListSearchSelectorComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListSearchSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
