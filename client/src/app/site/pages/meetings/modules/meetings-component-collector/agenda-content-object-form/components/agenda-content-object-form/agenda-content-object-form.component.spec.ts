import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaContentObjectFormComponent } from './agenda-content-object-form.component';

xdescribe(`AgendaContentObjectFormComponent`, () => {
    let component: AgendaContentObjectFormComponent;
    let fixture: ComponentFixture<AgendaContentObjectFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AgendaContentObjectFormComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AgendaContentObjectFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
