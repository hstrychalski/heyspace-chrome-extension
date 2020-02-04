function UpdateCardFormMessageHandler(chromeRuntime, BackgroundMessageSender) {

    const UPDATE_TYPE_CARD_CREATED = 'cardCreated';
    const UPDATE_TYPE_CREATE_CARD_ERROR = 'cardCreateError';

    var self = this;
    this.chromeRuntime = chromeRuntime;
    this.BackgroundMessageSender = BackgroundMessageSender;

    this.bindUpdateFormMessageHandlers = function() {
        this.chromeRuntime.onMessage.addListener(function(message, sender, sendMessage) {
                switch(message.type) {
                    case UPDATE_TYPE_CARD_CREATED:
                        let taskId = message.response.id;
                        let projectId = message.response.projectId;
                        let taskName = message.response.name;
                        let newlyCreatedTaskLink = self.getNewlyCreatedTaskLink(taskId, projectId);
                        self.renderNewlyCreatedTaskLink(newlyCreatedTaskLink, taskName);
                        break;
                    case UPDATE_TYPE_CREATE_CARD_ERROR:
                        let errorMessage = message.message;
                        alert(errorMessage);
                }
        });
    };

    this.getNewlyCreatedTaskLink = function(taskId, projectId) {
        return 'https://app.hey.space/projects/' + projectId + '/kanban?taskId=' + taskId;
    };

    this.renderNewlyCreatedTaskLink = function(link, taskName) {
        let href = '<a href="' + link +'">' + taskName + '</a>';
        $('#created-project-link-container').empty();
        $('#created-project-link-container').append(href);

        $("#created-project-link-container a").click(function () {
            let message = {
                action: 'createTab',
                url: link,
            };
            self.BackgroundMessageSender.sendBackgroundMessage(message);
        });
    };
}