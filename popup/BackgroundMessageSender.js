function BackgroundMessageSender (chromeRuntime) {

    this.chromeRuntime = chromeRuntime;

    this.sendBackgroundMessage = function(message)
    {
        this.chromeRuntime.sendMessage(message, function (response) {});
    };

    this.sendBackgroundMessageWithCallback = function (message, responseCallback) {
        chrome.runtime.sendMessage(message, responseCallback)
    };
}