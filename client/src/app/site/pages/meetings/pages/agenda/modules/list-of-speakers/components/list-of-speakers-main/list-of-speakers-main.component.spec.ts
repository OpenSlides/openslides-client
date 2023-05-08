import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfSpeakersMainComponent } from './list-of-speakers-main.component';

xdescribe(`TopicDetailMainComponent`, () => {
    let component: ListOfSpeakersMainComponent;
    let fixture: ComponentFixture<ListOfSpeakersMainComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ListOfSpeakersMainComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListOfSpeakersMainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
