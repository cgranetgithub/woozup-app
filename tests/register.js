describe('register', function() {
  it('should click on create button', function() {
    browser.get('http://localhost:8100');

    element(by.name('register-button')).click();
    element(by.model('data.email')).sendKeys('toto@toto.com');
    element(by.model('data.password')).sendKeys('password');
    element(by.name('create-button')).click();
    expect(element(by.model('data.first_name')).getText()).toEqual('toto');
    browser.get('http://localhost:8100');
    var types = element.all(by.repeater('type in types.page.objects'));
    types.first().click();
    element(by.name('next-button')).click();
  });
});
