function DataService (apiResourceFetcher, dataStorage, popupMessageSender, apiResourceManager) {
    var self = this;

    const RESOURCE_FETCH_TYPE_ORGANIZATIONS = 'organizations';
    const RESOURCE_FETCH_TYPE_PROJECTS = 'organizationProjects';
    const RESOURCE_FETCH_TYPE_LISTS = 'projectLists';

    this.ApiResourceFetcher = apiResourceFetcher;
    this.ApiResourceManager = apiResourceManager;
    this.DataStorage = dataStorage;
    this.PopupMessageSender = popupMessageSender;

    /**
     * Call proper resource fetching function based on message type property sent from popup.html
     */
    this.fetchRequestedResource = function(message) {
        switch (message.type) {
            case RESOURCE_FETCH_TYPE_ORGANIZATIONS:
                return this.fetchOrganizations();
            case RESOURCE_FETCH_TYPE_PROJECTS:
                return this.fetchOrganizationProjects(message.organizationId);
            case RESOURCE_FETCH_TYPE_LISTS:
                return this.fetchProjectLists(message.organizationId, message.projectId);
            default:
                throw Error('Unsupported message type');
        }
    };

    /**
     * Perform request, save to storage and then notify popup.html about data update
     */
    this.fetchOrganizations = function() {
        return new Promise((resolve, reject) => {
            let organizationsApiResource = this.getOrganizationsApiResource();
            self.ApiResourceFetcher.fetchApiResource(organizationsApiResource)
                .then(organizations => {
                    self.DataStorage.saveOrganizations(organizations)
                        .then(() => {
                            let response = {
                                type: 'updateOrganizations',
                                data: organizations
                            };
                            resolve(response);
                        })
                }).catch(error => {
                    reject(error);
            });
        })
    };

    /**
     * Perform request, save to storage and then send response to popup.html
     */
    this.fetchOrganizationProjects = function(organizationId) {
        return new Promise((resolve, reject) => {
            let projectsApiResource = this.getProjectsApiResource(organizationId);
            self.ApiResourceFetcher.fetchApiResource(projectsApiResource)
                .then(projects => {
                    self.DataStorage.saveOrganizationProjects(organizationId, projects)
                        .then(() => {
                            let response = {
                                data: projects,
                                type: RESOURCE_FETCH_TYPE_PROJECTS,
                            };
                            resolve(response);
                        });
                }).catch(error => {
                    reject(error);
            });
        });
    };


    /**
     * Perform request, save to storage and then send response to popup.html
     */
    this.fetchProjectLists = function(organizationId, projectId) {
        return new Promise((resolve, reject) => {
            let listsApiResource = this.getListsApiResource(projectId);
            self.ApiResourceFetcher.fetchApiResource(listsApiResource)
                .then(lists => {
                    self.DataStorage.saveProjectLists(organizationId, projectId, lists);
                    let response = {
                        data: lists,
                        type: RESOURCE_FETCH_TYPE_LISTS,
                    };
                    resolve(response)
                }).catch(error => {
                    reject(error);
            });
        });
    };

    this.getOrganizationsApiResource = function() {
        return this.ApiResourceManager.getResource(ApiResourceConstants.API_RESOURCE_ORGANIZATIONS);
    };

    this.getProjectsApiResource = function(organizationId) {
        let params = {
            organizationId: organizationId,
        };
        return this.ApiResourceManager.getResource(ApiResourceConstants.API_RESOURCE_PROJECTS, params);
    };

    this.getListsApiResource = function(projectId) {
        let params = {};
        params.projectId = projectId;
        return this.ApiResourceManager.getResource(ApiResourceConstants.API_RESOURCE_LISTS, params);
    };
}
