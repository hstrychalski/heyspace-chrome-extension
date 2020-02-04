function AuthHelper (accessTokenStorageKey) {

    this.accessTokenStorageKey = accessTokenStorageKey;

    this.getBasicHttpAuthHeaderValue = function() {
        let credentials = this.getApplicationOAuthCredentials();
        return 'Basic ' + btoa(credentials.clientId + ':' + credentials.clientSecret);
    };

    this.getAccessTokenHeaderValue = function() {
        let chromeExtensionToken = JSON.parse(localStorage.getItem(accessTokenStorageKey));
        let accessToken = chromeExtensionToken['access_token'];
        return 'Bearer ' + accessToken;
    };

    this.getApplicationOAuthCredentials = function () {
        let credentials = {};
         credentials.clientId = CLIENT_ID;
         credentials.clientSecret = CLIENT_SECRET;
         credentials.redirectUri = REDIRECT_URI;
        return credentials;
    };

    this.prepareAccessTokenRequestBody = function(code) {
        let credentials = this.getApplicationOAuthCredentials();
        let formData = new URLSearchParams();

        formData.append('client_id', credentials.clientId);
        formData.append('redirect_uri', credentials.redirectUri);
        formData.append('grant_type', 'authorization_code');
        formData.append('code', code);
        return formData;
    };

    this.prepareRefreshAccessTokenRequestBody = function() {
        let credentials = this.getApplicationOAuthCredentials();
        let chromeExtensionToken = JSON.parse(localStorage.getItem(accessTokenStorageKey));
        let refreshToken = chromeExtensionToken.refresh_token;
        let formData = new URLSearchParams();

        formData.append('client_id', credentials.clientId);
        formData.append('client_secret', credentials.clientSecret);
        formData.append('grant_type', 'refresh_token');
        formData.append('refresh_token', refreshToken);
        formData.append('scope', 'heyspace');

        return formData;
    };

    this.isTokenStored = function(){
        let token = localStorage.getItem(this.accessTokenStorageKey);
        return token !== null;
    };

    this.saveAccessToken = function(token) {
        let timeToExpiration = token.expires_in; //time in seconds
        let currentDateTime = new Date().getTime() / 1000; //unix timestamp
        let expiresAt = currentDateTime + timeToExpiration;

        delete token.expires_in;
        token.expires_at = expiresAt;
        localStorage.setItem(this.accessTokenStorageKey, JSON.stringify(token));
    };

    this.buildHeySpaceRedirectUrl = function() {
        let url = new URL(HS_BASE_URL + HS_AUTH_PATH);
        url.searchParams.append('client_id', CLIENT_ID);
        url.searchParams.append('redirect_uri', REDIRECT_URI);
        url.searchParams.append('scope', SCOPE);
        url.searchParams.append('response_type', RESPONSE_TYPE);
        return url;
    };
}