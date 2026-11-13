import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';

import { SortFilterBarComponent } from './sort-filter-bar.component';

xdescribe(`SortFilterBarComponent`, () => {
    class TestIdentifiable implements Identifiable {
        readonly id: Id;
    }

    let component: SortFilterBarComponent<TestIdentifiable>;
    let fixture: ComponentFixture<SortFilterBarComponent<TestIdentifiable>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SortFilterBarComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SortFilterBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
