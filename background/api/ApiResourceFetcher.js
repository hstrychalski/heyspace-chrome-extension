function ApiResourceFetcher(ApiClient) {
    this.ApiClient = ApiClient;
    var self = this;

    this.fetchApiResource = function (apiResource) {
        switch (apiResource.getName()) {
            case ApiResourceConstants.API_RESOURCE_ORGANIZATIONS:
                return this.getUserOrganizations(apiResource);
            case ApiResourceConstants.API_RESOURCE_PROJECTS:
                return this.getOrganizationProjects(apiResource);
            case ApiResourceConstants.API_RESOURCE_LISTS:
                return this.getProjectLists(apiResource);
        }
    };

    this.getUserOrganizations = function(organizationsApiResource) {
        return this.ApiClient.request(organizationsApiResource.getPath(), 'GET', undefined)
            .then(organizationsResponse => {
                return organizationsResponse.response['organizations'].map(function(item) {
                    return {
                        id: item.id,
                        name: item.name
                    }
                })
            })
            .catch(error => {
                handleError(error);
            });
    };

    this.getOrganizationProjects = function(projectsApiResource) {

        return this.ApiClient.request(projectsApiResource.getPath(), 'GET', undefined)
            .then(projectsResponse => {
                return projectsResponse.response['projects'].filter(function (item) {
                    return !(!item.name || item.name === '');
                })
            }).then(projects => {
                let projectsResult = {};
                projects.forEach(function(item){
                    if (item.isArchived === false) {
                        projectsResult[item.id] = {
                            name: item.name,
                            organizationId: item.organizationId,
                        };
                    }
                });
                return projectsResult;
            }).catch(error => {
                handleError(error);
            });
    };

    this.getProjectLists = function(listsApiResource) {

        return this.ApiClient.request(listsApiResource.getPath(), 'GET', undefined)
            .then(listsResponse => {
                return listsResponse.response['lists'];
            }).then(lists => {
                return lists.map(function(item) {
                    return {
                        id: item.id,
                        name: item.name
                    }
                });
            }).catch(error => {
                handleError(error);
            });
    };

    function handleError (error) {
        throw error;
    }
}