import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaSortComponent } from './agenda-sort.component';

xdescribe(`AgendaSortComponent`, () => {
    let component: AgendaSortComponent;
    let fixture: ComponentFixture<AgendaSortComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AgendaSortComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AgendaSortComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
