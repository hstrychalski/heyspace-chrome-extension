chrome.runtime.onMessage.addListener( function(request,sender,sendResponse) {

    if (request.action === 'createTab') {
        let newURL = request.url;
        chrome.tabs.create({ url: newURL });
    }

    if (request.action === 'redirect') {
        const authHelper = new AuthHelper(HS_ACCESS_TOKEN_STORAGE_KEY);
        let redirectUri = authHelper.buildHeySpaceRedirectUrl();
        chrome.tabs.update({ url: redirectUri.href });
    }

    if (request.action === 'createCard') {
        createCard(request.card);
        sendAmplitudeCreateCardEvent(request.selectedOrganizationId);
    }

    if (request.action ==='fetchResource') {
        const dataServiceFactory = new DataServiceFactory();
        const dataService = dataServiceFactory.getDataService();
        dataService.fetchRequestedResource(request)
            .then(response => {
                sendResponse(response);
            });
        return true;
    }
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        const authHelper = new AuthHelper(HS_ACCESS_TOKEN_STORAGE_KEY);
        const redirectUrlHelper = new RedirectUrlHelper();
        const authenticator = new OAuth2Authenticator(authHelper);


        let credentials = authHelper.getApplicationOAuthCredentials();
        if (Object.keys(credentials).length > 0) {
            let redirectUri = credentials.redirectUri;
            let redirectUriPattern = redirectUrlHelper.getRedirectUriEscapedRegexPattern(redirectUri);
            let currentUrl = tab.url;
            let redirectUrlRegex = new RegExp(redirectUriPattern);

            if (redirectUrlRegex.test(currentUrl)) {
                let authorizationCode = redirectUrlHelper.extractAuthCodeFromUrl(currentUrl);
                authenticator.obtainAccessToken(authorizationCode);
            }
        }
    }
});

function createCard(card) {
    const apiClientFactory = new ApiClientFactory();
    const apiClient = apiClientFactory.getApiClient();
    const popupMessageSender = new PopupMessageSender(chrome.runtime);
    const createCardService = new CreateCardService(apiClient, popupMessageSender);

    createCardService.createCard(card);
}

function sendAmplitudeCreateCardEvent(organizationId) {
    let event = {
        'user_id': organizationId,
        'event_type': 'create_card'
    };
    let events = [event];
    let payload = {
        'api_key': '14da5d294de1cae8dddfddf8ab37821b',
        'events': events,
    };
    let init = {};
    init.body = JSON.stringify(payload);
    init.method = 'POST';

    fetch('https://api.amplitude.com/2/httpapi', init)
        .then(response => {
            if (response.code !== 200) {
                console.log(response.json());
            }

            }).catch(error => {
                console.log(error);
    });
}

