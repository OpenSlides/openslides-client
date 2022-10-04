Cypress.on('uncaught:exception', err => !err.message.match(/^[^(ResizeObserver loop limit exceeded)]/));
