import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantImportListComponent } from './participant-import-list.component';

xdescribe(`ParticipantImportListComponent`, () => {
    let component: ParticipantImportListComponent;
    let fixture: ComponentFixture<ParticipantImportListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantImportListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantImportListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
