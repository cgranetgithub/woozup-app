describe('register', function() {
  it('should click on create button', function() {
    browser.get('http://localhost:8100');

    element(by.name('register-button')).click();
    element(by.name('login-input')).sendKeys('toto@toto.com');
    element(by.name('password-input')).sendKeys('password');
    element(by.name('create-button')).click();
  });
});
