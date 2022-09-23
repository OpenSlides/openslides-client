import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeMetaInfoComponent } from './committee-meta-info.component';

xdescribe(`CommitteeMetaInfoComponent`, () => {
    let component: CommitteeMetaInfoComponent;
    let fixture: ComponentFixture<CommitteeMetaInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitteeMetaInfoComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeMetaInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
