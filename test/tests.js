describe('Samwise Tests', function () {

  describe('basics', function () {
    it('samwise global should be available', function () {
      expect(samwise).to.be.ok();
    });

    it('should be mounted', function () {
      expect(samwise.mounted).to.be(true);
    });

    it('should export a toggle function', function () {
      expect(samwise.toggle).to.not.equal(undefined);
    });

    it('should have inserted samwise in the page', function () {
      var sw = document.querySelector('.sw');
      expect(sw).to.not.equal(null);
    });
  });

  describe('with Samwise open', function () {
    afterEach(function () {
      var outerContainer = document.querySelector('.sw-outerContainer');
      if (outerContainer.classList.contains('is-visible')) {
        samwise.toggle();
      }
    });

    it('should open the widget when clicking the trigger', function () {
      var button = document.querySelector('#trigger');
      var outerContainer = document.querySelector('.sw-outerContainer');
      expect(outerContainer.classList.contains('is-visible')).to.be(false);
      button.click();
      expect(outerContainer.classList.contains('is-visible')).to.be(true);
    });

    it('there should be 3 articles', function () {
      var articles = document.querySelectorAll('.sw-listElem');
      expect(articles).to.have.length(3);
    });

    it('there should be 2 buttons', function () {
      var buttons = document.querySelectorAll('.sw-button');
      expect(buttons).to.have.length(2);
    });
  });

});

