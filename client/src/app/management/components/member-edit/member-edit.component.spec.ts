import { ComponentFixture, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from 'e2e-imports.module';

import { MemberEditComponent } from './member-edit.component';

describe('MemberEditComponent', () => {
    let component: MemberEditComponent;
    let fixture: ComponentFixture<MemberEditComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            declarations: [MemberEditComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MemberEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
