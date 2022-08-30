import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeDetailViewComponent } from './committee-detail-view.component';

xdescribe(`CommitteeDetailViewComponent`, () => {
    let component: CommitteeDetailViewComponent;
    let fixture: ComponentFixture<CommitteeDetailViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitteeDetailViewComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeDetailViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
