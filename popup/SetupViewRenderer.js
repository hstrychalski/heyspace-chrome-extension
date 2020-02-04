function SetupViewRenderer (backgroundMessageSender) {

    this.backgroundMessageSender = backgroundMessageSender;
    this.setupButtonContainerSelector = $('#setup-view-container');
    this.setupButtonSelector = $('#heyspace-account-setup-button');
    var self = this;

    this.bindSetupButtonClickHandler = function() {
        this.showSetupViewContainer();
        this.setupButtonSelector.on('click', function(e) {
            let message = {
                action: 'redirect'
            };
            self.backgroundMessageSender.sendBackgroundMessage(message);
        });
    };

    this.showSetupViewContainer = function () {
        self.setupButtonContainerSelector.css('display','flex');
        $('body').css('height', '250px');
    };

    this.hideSetupViewContainer = function () {
        self.setupButtonContainerSelector.hide();
    }
}