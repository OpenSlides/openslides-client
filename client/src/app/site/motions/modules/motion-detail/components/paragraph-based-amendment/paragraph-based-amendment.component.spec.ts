import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { E2EImportsModule } from 'e2e-imports.module';

import { ParagraphBasedAmendmentComponent } from './paragraph-based-amendment.component';

describe('ParagraphBasedAmendmentComponent', () => {
    let component: ParagraphBasedAmendmentComponent;
    let fixture: ComponentFixture<ParagraphBasedAmendmentComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [E2EImportsModule],
                declarations: [ParagraphBasedAmendmentComponent]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(ParagraphBasedAmendmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
