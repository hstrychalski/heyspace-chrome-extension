function ApiResourceManager () {
    this.getResource = function(name, params) {
        switch (name) {
            case ApiResourceConstants.API_RESOURCE_ORGANIZATIONS:
                return new ApiResource(ApiResourceConstants.API_RESOURCE_ORGANIZATIONS, '/users/self/organizations');
            case ApiResourceConstants.API_RESOURCE_PROJECTS:
                return new ApiResource(ApiResourceConstants.API_RESOURCE_PROJECTS, '/organizations/' + params['organizationId'] + '/projects', params);
            case ApiResourceConstants.API_RESOURCE_LISTS:
                return new ApiResource(ApiResourceConstants.API_RESOURCE_LISTS, '/projects/' + params['projectId'] + '/lists', params);
        }
    }
}

function ApiResource (name, path, optionalParams) {
    this.name = name;
    this.path = path;
    this.params = optionalParams;

    this.getName = function() {
        return this.name;
    };

    this.getPath = function() {
        return this.path;
    };

    this.getParams = function() {
        return this.params;
    }
}