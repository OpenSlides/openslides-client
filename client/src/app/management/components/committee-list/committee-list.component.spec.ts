import { ComponentFixture, TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { CommitteeListComponent } from './committee-list.component';

describe(`CommitteeListComponent`, () => {
    let component: CommitteeListComponent;
    let fixture: ComponentFixture<CommitteeListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            declarations: [CommitteeListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommitteeListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
