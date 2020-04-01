import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../../../e2e-imports.module';
import { MeetingSettingsOverviewComponent } from './meeting-settings-overview.component';

describe('SettingsOverviewComponent', () => {
    let component: MeetingSettingsOverviewComponent;
    let fixture: ComponentFixture<MeetingSettingsOverviewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            declarations: [MeetingSettingsOverviewComponent]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MeetingSettingsOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
