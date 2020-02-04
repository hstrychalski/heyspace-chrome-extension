function PopupMessageSender (chromeRuntime) {

    this.chromeRuntime = chromeRuntime;

    this.sendPopupMessage = function(message)
    {
        if (this.isPopupOpen()) {
            this.chromeRuntime.sendMessage(message, function (response) {});
        }
    };

    this.isPopupOpen = function() {
        let views = chrome.extension.getViews({ type: 'popup' });
        return views.length > 0;
    };
}