import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from 'e2e-imports.module';

import { StatuteParagraphImportListComponent } from './statute-paragraph-import-list.component';

describe('StatuteParagraphImportListComponent', () => {
    let component: StatuteParagraphImportListComponent;
    let fixture: ComponentFixture<StatuteParagraphImportListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [StatuteParagraphImportListComponent],
            imports: [E2EImportsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(StatuteParagraphImportListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
