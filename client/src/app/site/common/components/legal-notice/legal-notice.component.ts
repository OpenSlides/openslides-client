import { Component, OnInit } from '@angular/core';

import { environment } from 'environments/environment';

import { AuthTokenService } from 'app/core/core-services/auth-token.service';
import { DataStoreService } from 'app/core/core-services/data-store.service';
import { HttpService } from 'app/core/core-services/http.service';
import { LifecycleService } from 'app/core/core-services/lifecycle.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { TopicRepositoryService } from 'app/core/repositories/topics/topic-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { UpdateService } from 'app/core/ui-services/update.service';
import { BaseComponent } from 'app/site/base/components/base.component';

@Component({
    selector: 'os-legal-notice',
    templateUrl: './legal-notice.component.html'
})
export class LegalNoticeComponent extends BaseComponent implements OnInit {
    /**
     * Whether this component is in editing-mode.
     */
    public isEditing = false;

    /**
     * Holds the current legal-notice.
     */
    public legalNotice = '';

    public showDevTools = false;

    /**
     * Constructor.
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private lifecycleService: LifecycleService,
        private update: UpdateService,
        private operator: OperatorService,
        private DS: DataStoreService,
        private http: HttpService,
        private authTokenService: AuthTokenService,
        private topicRepo: TopicRepositoryService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        super.setTitle(this.translate.instant('Legal notice'));
    }

    public resetCache(): void {
        this.lifecycleService.reboot();
    }

    public checkForUpdate(): void {
        this.update.checkForUpdate();
    }

    /**
     * Saves changes.
     */
    public saveChanges(): void {
        /*this.configRepo
            .bulkUpdate([{ key: 'general_event_legal_notice', value: this.legalNotice }])
            .then(() => (this.isEditing = !this.isEditing), this.raiseError);
        */
        throw new Error('TODO');
    }

    /**
     * Returns, if the current user has the necessary permissions.
     */
    public canManage(): boolean {
        return this.operator.hasPerms(Permission.meetingCanManageSettings);
    }

    public printDS(): void {
        this.DS.print();
    }

    public getThisComponent(): void {
        console.log(this);
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

    public async doAuthenticate(): Promise<void> {
        // try {
        //     await this.http.post(`https://auth:9004/internal/auth/api/authenticate`);
        // } catch (e) {
        //     console.log('Error while authenticating', e);
        // }
        const payload = [
            {
                presenter: 'server_time'
            }
        ];
        const servertimeResponse = await this.http.post<any[]>('/system/presenter/handle_request', payload);
        console.log('servertimeResponse', servertimeResponse);
    }

    /**
     * End of testing purposes
     */
}
