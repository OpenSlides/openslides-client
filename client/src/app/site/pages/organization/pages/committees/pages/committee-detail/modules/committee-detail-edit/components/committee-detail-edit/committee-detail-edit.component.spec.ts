import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeDetailEditComponent } from './committee-detail-edit.component';

xdescribe(`CommitteeDetailEditComponent`, () => {
    let component: CommitteeDetailEditComponent;
    let fixture: ComponentFixture<CommitteeDetailEditComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitteeDetailEditComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeDetailEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
