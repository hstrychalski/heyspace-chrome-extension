function CreateCardService (ApiClient, PopupMessageSender) {
    this.apiClient = ApiClient;
    this.popupMessageSender = PopupMessageSender;

    const MESSAGE_TYPE_CARD_CREATED = 'cardCreated';
    const MESSAGE_TYPE_CREATE_CARD_ERROR = 'cardCreateError';
    var self = this;

    this.createCard = function(card) {

        try {
            this.validateCardForm(card);
        } catch (error) {
            let message = error.message;
            let popupMessage = {
                type: MESSAGE_TYPE_CREATE_CARD_ERROR,
                message: message,
            };
            self.popupMessageSender.sendPopupMessage(popupMessage);
            return;
        }

        let additionalHeaders = [
            { name: 'Content-Type', value: 'application/json' }
        ];

        this.apiClient.request('/tasks', 'POST', JSON.stringify(card), additionalHeaders)
            .then(response => {
                if (response.code !== 200) {
                    throw response;
                }
                let message = { type: MESSAGE_TYPE_CARD_CREATED, response: response.response };
                self.popupMessageSender.sendPopupMessage(message);
            }).catch(error => {
                let errorMessage = error.message;
                let popupMessage = {
                    type: MESSAGE_TYPE_CREATE_CARD_ERROR,
                    message: errorMessage,
                };
                self.popupMessageSender.sendPopupMessage(popupMessage);
        });
    };

    this.validateCardForm = function(card) {
        let errorMessage = 'Create card failed, please select ';

        if (!card.projectId) {
            errorMessage += 'project';
            throw new Error(errorMessage);
        }
        if (!card.taskListId) {
            errorMessage += 'list';
            throw new Error(errorMessage);
        }
    }
}