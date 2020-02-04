function ApiClient (baseApiUrl, authHeaderKey, authHeaderValue, authenticator) {

    this.baseApiUrl = baseApiUrl;
    this.authHeaderKey = authHeaderKey;
    this.authHeaderValue = authHeaderValue;
    this.authenticator = authenticator;
    var self = this;

    this.getAuthHeader = function() {
        let key = this.authHeaderKey;
        let val = this.authHeaderValue;
        return {
            [key]: val,
        }
    };

    this.request = function(path, method, body, additionalHeaders) {

        let init = {
            method: method,
            headers: this.getAuthHeader(),
        };

        if (additionalHeaders && additionalHeaders.length > 0) {
            additionalHeaders.forEach(header => {
                init.headers[header.name] = header.value;
            });
        }

        if (body) {
            init.body = body;
        }

        return fetch(this.baseApiUrl + path, init
        ).then(response => {
            if (response.status === 401) {
                let error = {};
                error.code = 401;
                throw error;
            }
            return response.json();
        }).then(jsonResponse => {
            return jsonResponse;
        }).catch(async error => {
            if (error.code && error.code === 401) {
                try {
                    await self.authenticator.refreshAccessToken();
                    self.authHeaderValue = self.getAccessTokenHeaderValue();
                    return self.request(path, method, body, additionalHeaders);
                } catch (e) {
                    alert('Error while refreshing token');
                }
            }
        });
    };

    this.getAccessTokenHeaderValue = function() {
        let chromeExtensionToken = JSON.parse(localStorage.getItem(HS_ACCESS_TOKEN_STORAGE_KEY));
        let accessToken = chromeExtensionToken['access_token'];
        return 'Bearer ' + accessToken;
    };
}