function ApiClientFactory () {

    this.getApiClient = function() {
        const authHelper = new AuthHelper(HS_ACCESS_TOKEN_STORAGE_KEY);
        const oAuth2Authenticator = new OAuth2Authenticator(authHelper);
        return new ApiClient(HS_API_BASE_URL, 'Authorization', authHelper.getAccessTokenHeaderValue(), oAuth2Authenticator);
    };
}