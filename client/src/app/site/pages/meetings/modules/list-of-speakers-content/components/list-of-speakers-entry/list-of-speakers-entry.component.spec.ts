import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfSpeakersContentComponent } from './list-of-speakers-content.component';

xdescribe(`ListOfSpeakersContentComponent`, () => {
    let component: ListOfSpeakersContentComponent;
    let fixture: ComponentFixture<ListOfSpeakersContentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ListOfSpeakersContentComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListOfSpeakersContentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
