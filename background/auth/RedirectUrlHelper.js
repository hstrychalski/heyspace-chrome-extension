function RedirectUrlHelper () {

    this.getRedirectUriEscapedRegexPattern = function(rawRedirectUri) {
        let uriArray = rawRedirectUri.split( '//' );
        uriArray.shift();
        let uriWithoutProtocol = uriArray.join('//');
        let escapedProtocol = 'https:\\/\\/'; //workaround - function escapeRegExp did not escape double forward slash in https://
        let escapedUri = this.escapeRegExp(uriWithoutProtocol);
        let escapedQueryParam = this.escapeRegExp('/?code=');

        return '^' + escapedProtocol + escapedUri + escapedQueryParam;
    };

    this.extractAuthCodeFromUrl = function(codeUrl) {
        let urlAsArray = codeUrl.split('code=');
        return urlAsArray[urlAsArray.length - 1];
    };

    this.escapeRegExp = function(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    };
}