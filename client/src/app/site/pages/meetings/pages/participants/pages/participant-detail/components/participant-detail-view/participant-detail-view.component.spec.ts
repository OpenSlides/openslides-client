import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantDetailViewComponent } from './participant-detail-view.component';

xdescribe(`ParticipantDetailViewComponent`, () => {
    let component: ParticipantDetailViewComponent;
    let fixture: ComponentFixture<ParticipantDetailViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantDetailViewComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantDetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
