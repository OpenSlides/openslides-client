import { ComponentFixture, TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { CommitteeEditComponent } from './committee-edit.component';

describe(`CommitteeEditComponent`, () => {
    let component: CommitteeEditComponent;
    let fixture: ComponentFixture<CommitteeEditComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            declarations: [CommitteeEditComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
