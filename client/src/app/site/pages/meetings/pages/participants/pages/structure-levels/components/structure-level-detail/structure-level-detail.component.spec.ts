import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureLevelDetailComponent } from './structure-level-detail.component';

xdescribe(`StructureLevelDetailComponent`, () => {
    let component: StructureLevelDetailComponent;
    let fixture: ComponentFixture<StructureLevelDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StructureLevelDetailComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StructureLevelDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
