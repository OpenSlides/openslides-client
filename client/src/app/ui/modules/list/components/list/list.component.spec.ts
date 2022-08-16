import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Identifiable } from 'src/app/domain/interfaces';

import { ListComponent } from './list.component';

xdescribe(`ListComponent`, () => {
    let component: ListComponent<Identifiable>;
    let fixture: ComponentFixture<ListComponent<Identifiable>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
