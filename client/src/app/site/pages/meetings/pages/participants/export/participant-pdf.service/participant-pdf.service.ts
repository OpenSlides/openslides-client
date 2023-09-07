import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Column, Content, ContentColumns, ContentTable, TableCell } from 'pdfmake/interfaces';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';

import { ParticipantExportModule } from '../participant-export.module';

/**
 * Creates a pdf for a user, containing greetings and initial login information
 * Provides the public methods `userAccessToDocDef(user: ViewUser)` and
 * `createUserListDocDef(users:ViewUser[])` which should be convenient to use.
 * @example
 * ```ts
 * const pdfMakeCompatibleDocDef = this.UserPdfService.userAccessToDocDef(User);
 * const pdfMakeCompatibleDocDef = this.UserPdfService.createUserListDocDef(Users);
 * ```
 */
@Injectable({
    providedIn: ParticipantExportModule
})
export class ParticipantPdfService {
    /**
     * Constructor
     */
    public constructor(
        private translate: TranslateService,
        private meetingSettingsService: MeetingSettingsService,
        private orgaSettingsService: OrganizationSettingsService
    ) {}

    /**
     * Converts a user to PdfMake doc definition, containing access information
     * for login and wlan access, if applicable
     *
     * @returns doc def for the user
     */
    public userAccessToDocDef(user: ViewUser): Content {
        const userHeadline = [
            {
                text: user.short_name,
                style: `userDataTitle`
            }
        ];
        if (user.structure_level()) {
            userHeadline.push({
                text: user.structure_level(),
                style: `userDataHeading`
            });
        }
        return [userHeadline, this.createAccessDataContent(user), this.createWelcomeText()];
    }

    /**
     * Generates the document definitions for a participant list with the given users, sorted as in the input.
     *
     * @param users An array of users
     * @returns pdfMake definitions for a table including name, structure level and groups for each user
     */
    public createUserListDocDef(users: ViewUser[]): Content {
        const title = {
            text: this.translate.instant(`List of participants`),
            style: `title`
        };
        return [title, this.createUserList(users)];
    }

    /**
     * Handles the creation of access data for the given user
     *
     * @param user
     * @returns
     */
    private createAccessDataContent(user: ViewUser): ContentColumns {
        return {
            columns: [this.createUserAccessContent(user)],
            margin: [0, 20]
        };
    }

    /**
     * Creates access information (login name, initial password) for the given user,
     * additionally encoded in a qr code
     *
     * @param user
     * @returns pdfMake definitions
     */
    private createUserAccessContent(user: ViewUser): Column[] {
        const columnOpenSlides: Column[] = [
            {
                text: this.translate.instant(`OpenSlides access data`),
                style: `userDataHeading`
            },
            {
                text: this.translate.instant(`Username`) + `:`,
                style: `userDataTopic`
            },
            {
                text: user.username,
                style: `userDataValue`
            },
            {
                text: this.translate.instant(`Initial password`) + `:`,
                style: `userDataTopic`
            },
            {
                text: user.default_password || `-`,
                style: `userDataValue`
            },
            {
                text: `URL:`,
                style: `userDataTopic`
            },
            {
                text: this.orgaSettingsService.instant(`url`) || `-`,
                link: this.orgaSettingsService.instant(`url`),
                style: `userDataValue`
            },
            {
                text: `\n`
            }
        ];
        // url qr code
        if (this.orgaSettingsService.instant(`url`)) {
            columnOpenSlides.push(
                {
                    qr: this.orgaSettingsService.instant(`url`),
                    fit: 120,
                    margin: [0, 0, 0, 8]
                },
                {
                    text: this.translate.instant(`Scan this QR code to open URL.`),
                    style: `small`
                }
            );
        }
        return columnOpenSlides;
    }

    /**
     * Generates a welcone text according to the events' configuration
     *
     * @returns pdfMake definitions
     */
    private createWelcomeText(): Content {
        const users_pdf_welcometitle = this.meetingSettingsService.instant(`users_pdf_welcometitle`)!;
        const users_pdf_welcometext = this.meetingSettingsService.instant(`users_pdf_welcometext`)!;
        return [
            {
                text: users_pdf_welcometitle,
                style: `userDataHeading`
            },
            {
                text: users_pdf_welcometext,
                style: `userDataTopic`
            }
        ];
    }

    /**
     * Handles the creation of the participant lists' table structure
     *
     * @param users: passed through to getListUsers
     * @returns a pdfMake table definition ready to be put into a page
     */
    private createUserList(users: ViewUser[]): ContentTable {
        const userTableBody: TableCell[][] = [
            [
                {
                    text: `#`,
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Name`),
                    style: `tableHeader`
                },
                {
                    text: this.translate.instant(`Groups`),
                    style: `tableHeader`
                }
            ]
        ];
        return {
            table: {
                widths: [`auto`, `*`, `auto`],
                headerRows: 1,
                body: userTableBody.concat(this.getListUsers(users))
            },
            layout: `switchColorTableLayout`
        };
    }

    /**
     * parses the incoming users and generates pdfmake table lines for each of them
     *
     * @param users: The users to include, in order
     * @returns column definitions with odd and even entries styled differently,
     * short name, structure level and group name columns
     */
    private getListUsers(users: ViewUser[]): Column[] {
        const result: Column[] = [];
        let counter = 1;
        users.forEach(user => {
            const groupList = user.groups().map(grp => grp.name);
            result.push([{ text: `` + counter }, { text: user.full_name }, { text: groupList.join(`, `) }]);
            counter += 1;
        });
        return result;
    }
}
