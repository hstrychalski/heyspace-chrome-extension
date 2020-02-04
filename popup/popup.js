const HS_ACCESS_TOKEN_STORAGE_KEY = 'hs-chrome-extension-token';

$(document).ready(function() {
    const backgroundMessageSender = new BackgroundMessageSender(chrome.runtime);
    const dataRepository = new DataRepository();
    const cardFormRenderer = new CardFormRenderer(backgroundMessageSender, dataRepository);
    const updateCardFormMessageHandler = new UpdateCardFormMessageHandler(chrome.runtime, backgroundMessageSender);

    if (localStorage.getItem(HS_ACCESS_TOKEN_STORAGE_KEY) !== null) { //USER IS AUTHENTICATED
        cardFormRenderer.bindSelectEvents();
        updateCardFormMessageHandler.bindUpdateFormMessageHandlers();
        cardFormRenderer.initSearchSelect();

        let storedOrganizations = dataRepository.getStoredOrganizations();
        if (storedOrganizations.length > 0) {
            let recentlySelected = dataRepository.getRecentlySelected();
            cardFormRenderer.renderCardForm(storedOrganizations, recentlySelected.organization, recentlySelected.project, recentlySelected.list);
        } else {
            cardFormRenderer.disableEmptySelects();
        }
    } else {
        cardFormRenderer.hideCreateCardForm();
        const setupViewRenderer = new SetupViewRenderer(backgroundMessageSender);
        setupViewRenderer.bindSetupButtonClickHandler();
    }
});


