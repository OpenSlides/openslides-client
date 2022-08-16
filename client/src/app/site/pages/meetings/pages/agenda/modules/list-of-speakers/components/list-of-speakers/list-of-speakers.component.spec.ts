import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfSpeakersComponent } from './list-of-speakers.component';

xdescribe(`ListOfSpeakersComponent`, () => {
    let component: ListOfSpeakersComponent;
    let fixture: ComponentFixture<ListOfSpeakersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ListOfSpeakersComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListOfSpeakersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
