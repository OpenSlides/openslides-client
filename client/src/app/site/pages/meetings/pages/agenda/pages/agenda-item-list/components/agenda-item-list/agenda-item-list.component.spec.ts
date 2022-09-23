import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaItemListComponent } from './agenda-item-list.component';

xdescribe(`AgendaItemListComponent`, () => {
    let component: AgendaItemListComponent;
    let fixture: ComponentFixture<AgendaItemListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AgendaItemListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AgendaItemListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
