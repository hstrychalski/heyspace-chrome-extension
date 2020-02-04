function OAuth2Authenticator (AuthHelper) {

    this.AuthHelper = AuthHelper;
    this.accessTokenRequestInProgress = false;
    this.refreshTokenRequestInProgress = false;
    var self = this;

    this.obtainAccessToken = function (code) {
        let body = this.AuthHelper.prepareAccessTokenRequestBody(code);
        let accessTokenEndpointUrl = HS_BASE_API_URL + HS_API_TOKEN_ENDPOINT;
        let authorizationHeader = this.AuthHelper.getBasicHttpAuthHeaderValue();
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authorizationHeader,
        };

        if (!this.accessTokenRequestInProgress && !this.AuthHelper.isTokenStored()) {
            this.accessTokenRequestInProgress = true;
            return fetch(accessTokenEndpointUrl, {
                method: 'POST',
                headers: headers,
                body: body,
            }).then(response => {
                return response.json();
            }).then(token => {
                self.AuthHelper.saveAccessToken(token);
                self.renderAuthSuccessPage();
                self.accessTokenRequestInProgress = false;
            }).catch(error => {
                    self.accessTokenRequestInProgress = false;
                    console.log(error);
                });
        }
    };

    this.refreshAccessToken = async function () {
        let body = this.AuthHelper.prepareRefreshAccessTokenRequestBody();
        let accessTokenEndpointUrl = HS_BASE_API_URL + HS_API_TOKEN_ENDPOINT;
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        if (!this.refreshTokenRequestInProgress) {
            this.refreshTokenRequestInProgress = true;

            let response = await fetch(accessTokenEndpointUrl, {
                method: 'POST',
                headers: headers,
                body: body,
            });
            this.refreshTokenRequestInProgress = false;

            if (response.status === 200) {
                let token = await response.json();
                self.AuthHelper.saveAccessToken(token);
            } else {
                throw new Error(response.message);
            }
            return response;
        }
    };

    this.renderAuthSuccessPage = function() {
        chrome.tabs.update({url: chrome.extension.getURL(AUTH_SUCCESS_TEMPLATE_PATH)});
    };
}