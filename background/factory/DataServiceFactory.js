function DataServiceFactory () {

    this.getDataService = function() {
        var authHelper = new AuthHelper(HS_ACCESS_TOKEN_STORAGE_KEY);
        var apiResourceManager = new ApiResourceManager();
        var oAuth2Authenticator = new OAuth2Authenticator(authHelper);
        var apiClient = new ApiClient(HS_API_BASE_URL, 'Authorization', authHelper.getAccessTokenHeaderValue(), oAuth2Authenticator);
        var apiResourceFetcher = new ApiResourceFetcher(apiClient);
        var dataStorage = new DataStorage();
        var popupMessageSender = new PopupMessageSender(chrome.runtime);
        return new DataService(apiResourceFetcher, dataStorage, popupMessageSender, apiResourceManager);
    }
}