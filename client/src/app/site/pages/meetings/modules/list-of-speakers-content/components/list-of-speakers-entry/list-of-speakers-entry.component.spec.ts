import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfSpeakersEntryComponent } from './list-of-speakers-entry.component';

xdescribe(`ListOfSpeakersContentComponent`, () => {
    let component: ListOfSpeakersEntryComponent;
    let fixture: ComponentFixture<ListOfSpeakersEntryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ListOfSpeakersEntryComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListOfSpeakersEntryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
