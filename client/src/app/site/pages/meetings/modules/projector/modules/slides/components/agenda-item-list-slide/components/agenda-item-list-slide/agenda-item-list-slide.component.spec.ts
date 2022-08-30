import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaItemListSlideComponent } from './agenda-item-list-slide.component';

xdescribe(`AgendaItemListSlideComponent`, () => {
    let component: AgendaItemListSlideComponent;
    let fixture: ComponentFixture<AgendaItemListSlideComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AgendaItemListSlideComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AgendaItemListSlideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
