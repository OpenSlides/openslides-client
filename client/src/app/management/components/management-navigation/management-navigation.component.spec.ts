import { ComponentFixture, TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { ManagementNavigationComponent } from './management-navigation.component';

describe(`ManagementNavigationComponent`, () => {
    let component: ManagementNavigationComponent;
    let fixture: ComponentFixture<ManagementNavigationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            declarations: [ManagementNavigationComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ManagementNavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
