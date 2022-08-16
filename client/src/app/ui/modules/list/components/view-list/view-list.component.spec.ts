import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';

import { ViewListComponent } from './view-list.component';

xdescribe(`ViewListComponent`, () => {
    class TestIdentifiable implements Identifiable {
        readonly id: Id;
    }

    let component: ViewListComponent<TestIdentifiable>;
    let fixture: ComponentFixture<ViewListComponent<TestIdentifiable>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ViewListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ViewListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
