// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// load type definitions that come with Cypress module
/// <reference types="cypress" />
declare global {
    namespace Cypress {
        interface Chainable {
            urlShouldAllOf(...toCheck: { chainer: string; values: any[] }[]): void;
            /**
             * Signs in as a quick command, visits the given page and waits until the
             * page is ready.
             *
             * @param url the url to visit. Defaults to `/`.
             * @param username the username of a user to sign in as. Defaults to `admin`.
             * @param password the password of the user to sign in as. Defaults to `admin`.
             */
            loginAndVisit(url?: string, username?: string, password?: string): Cypress.Chainable;
            /**
             * Signs in as a quick command.
             *
             * @param username the username of a user to sign in as. Defaults to `admin`.
             * @param password the password of the user to sign in as. Defaults to `admin`.
             */
            login(username?: string, password?: string): void;
            logout(): void;
            /**
             * Sends a request to the backend.
             *
             * @param action the name of an action as string.
             * @param payload the payload for the action. Attention: This must be an array.
             */
            os4request<D = any>(action: string, payload: any): Chainable<D>;
            /**
             * Gets an element specific for test purposes.
             *
             * @param name the name for an element prefixed by `data-cy=`
             */
            getElement(name: string): Chainable<Element>;
            /**
             * Gets a form control element
             *
             * @param name the name for an element prefixed by `formcontrolname=`
             */
            getFormControl(name: string): Chainable<Element>;
            /**
             * Tries to find an anchor-HTML-element for a specific url.
             *
             * @param url the url an anchor points to.
             */
            getAnchorFor(url: string): Chainable<Element>;
            /**
             * Sends a request to clear the whole database.
             */
            clearDatabase(): void;
            /**
             * Inserts a user called "Administrator" into the datastore.
             * Their username is "admin" and their password is "admin".
             * They have the permission "OML.can_manage_organization".
             */
            createDefaultUser(): void;
            /**
             * Inserts a user called "superadmin" into the datastore.
             * Their username is "superadmin" and their password is "superadmin".
             * They have the permission "OML.superadmin".
             */
            createSuperUser(): void;
            /**
             * Creates a committee by request.
             *
             * @param name An optional name for the committee to create.
             */
            createCommittee(name?: string): Chainable<{ id: number; name: string }>;
            deleteCommittees(...ids: number[]): void;
            createMeeting(
                name?: string,
                admin_ids?: number[]
            ): Chainable<{ id: number; name: string; committeeId: number }>;
            deleteMeetings(...ids: number[]): void;
            createAccount(name?: string): Chainable<{ id: number; name: string }>;
            deleteAccounts(...ids: number[]): void;
        }

        interface Cypress {
            config(key: 'datastoreUrl'): string;
        }
    }
}

// Import commands.ts using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')
