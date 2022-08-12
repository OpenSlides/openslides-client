import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollCollectionComponent } from './poll-collection.component';

xdescribe(`PollCollectionComponent`, () => {
    // let component: PollCollectionComponent;
    // let fixture: ComponentFixture<PollCollectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PollCollectionComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        // fixture = TestBed.createComponent(PollCollectionComponent);
        // component = fixture.componentInstance;
        // fixture.detectChanges();
    });

    it(`should create`, () => {
        // expect(component).toBeTruthy();
    });
});
