import './commands'


Cypress.on('uncaught:exception', (err, runnable) => {
    if (err.message.includes('is not a function')) {
      return false
    }
    if (err.message.includes('Cannot read properties of undefined')) {
      return false
    }
  })