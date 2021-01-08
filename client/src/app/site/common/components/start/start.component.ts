import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from 'environments/environment';

import { AuthTokenService } from 'app/core/core-services/auth-token.service';
import { HttpService } from 'app/core/core-services/http.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { TopicRepositoryService } from 'app/core/repositories/topics/topic-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { BaseComponent } from 'app/site/base/components/base.component';

/**
 * Interface describes the keys for the fields at start-component.
 */
interface IStartContent {
    welcome_title: string;
    welcome_text: string;
}

/**
 * The start component. Greeting page for OpenSlides
 */
@Component({
    selector: 'os-start',
    templateUrl: './start.component.html',
    styleUrls: ['./start.component.scss']
})
export class StartComponent extends BaseComponent implements OnInit {
    /**
     * Whether the user is editing the content.
     */
    public isEditing = false;

    /**
     * Formular for the content.
     */
    public startForm: FormGroup;

    /**
     * Holding the values for the content.
     */
    public startContent: IStartContent = {
        welcome_title: '',
        welcome_text: ''
    };

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private meetingSettingsService: MeetingSettingsService,
        private formBuilder: FormBuilder,
        private operator: OperatorService,
        private http: HttpService,
        private authTokenService: AuthTokenService,
        private topicRepo: TopicRepositoryService
    ) {
        super(componentServiceCollector);
        this.startForm = this.formBuilder.group({
            welcome_title: ['', Validators.required],
            welcome_text: ''
        });
    }

    /**
     * Init the component.
     *
     * Sets the welcomeTitle and welcomeText.
     */
    public ngOnInit(): void {
        super.setTitle('Home');

        // set the welcome title
        this.meetingSettingsService
            .get('welcome_title')
            .subscribe(welcomeTitle => (this.startContent.welcome_title = welcomeTitle));

        // set the welcome text
        this.meetingSettingsService.get('welcome_text').subscribe(welcomeText => {
            this.startContent.welcome_text = this.translate.instant(welcomeText);
        });
    }

    /**
     * Changes to editing mode.
     */
    public editStartPage(): void {
        Object.keys(this.startForm.controls).forEach(control => {
            this.startForm.patchValue({ [control]: this.startContent[control] });
        });
        this.isEditing = true;
    }

    /**
     * Saves changes and updates the content.
     */
    public saveChanges(): void {
        /*this.configRepo
            .bulkUpdate(
                Object.keys(this.startForm.controls).map(control => ({
                    key: control,
                    value: this.startForm.value[control]
                }))
            )
            .then(() => (this.isEditing = !this.isEditing), this.raiseError);*/
        throw new Error('TODO');
    }

    /**
     * Returns, if the current user has the necessary permissions.
     */
    public canManage(): boolean {
        return this.operator.hasPerms(Permission.meetingCanManageSettings);
    }

    /**
     * Only testing purposes
     */
    private async createTopic(): Promise<any> {
        return await this.topicRepo.create({ text: 'Ich mag Kuchen', title: 'Hallo Kekse' });
    }

    public async testCreateTopic(): Promise<any> {
        return await this.createTopic();
    }

    public async testCreateTopicWithExpiredToken(): Promise<any> {
        this.authTokenService.resetAccessTokenToExpired();
        return await this.createTopic();
    }

    public apiAuthRequestWithTokenCookie(): void {
        this.http.get(`${environment.authUrlPrefix}/api/hello`).then(response => console.log('response', response));
    }

    public apiAuthRequestWithCookie(): void {
        this.authTokenService.resetAccessTokenToNull();
        this.apiAuthRequestWithTokenCookie();
    }

    public apiAuthRequestWithInvalidToken(): void {
        this.authTokenService.resetAccessTokenToInvalid();
        this.apiAuthRequestWithTokenCookie();
    }

    public apiAuthRequestWithExpiredToken(): void {
        this.authTokenService.resetAccessTokenToExpired();
        this.apiAuthRequestWithTokenCookie();
    }

    /**
     * End of testing purposes
     */
}
