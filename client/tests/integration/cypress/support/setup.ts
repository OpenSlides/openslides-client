Cypress.on('uncaught:exception', err => !err.message.match(/^[^(ResizeObserver loop limit exceeded)]/));

Cypress.on('window:before:load', window => {
    Object.defineProperty(window.navigator, 'language', { value: 'en-GB' });
    Object.defineProperty(window.navigator, 'languages', { value: ['en'] });
    Object.defineProperty(window.navigator, 'accept_languages', { value: ['en'] });
});
