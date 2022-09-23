import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatuteParagraphImportListComponent } from './statute-paragraph-import-list.component';

xdescribe(`StatuteParagraphImportListComponent`, () => {
    let component: StatuteParagraphImportListComponent;
    let fixture: ComponentFixture<StatuteParagraphImportListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StatuteParagraphImportListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StatuteParagraphImportListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
