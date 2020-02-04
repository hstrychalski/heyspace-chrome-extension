function DataRepository () {

    const ORGANIZATION_PREFIX = 'hs-organization-';

    const RECENTLY_SELECTED = 'recently-selected';
    const RECENTLY_SELECTED_ORGANIZATION = 'organization';
    const RECENTLY_SELECTED_PROJECT = 'project';
    const RECENTLY_SELECTED_LIST = 'list';

    this.getStoredOrganizations = function() {
        let organizations = [];
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).startsWith(ORGANIZATION_PREFIX)) {
                let jsonOrganization = localStorage.getItem(localStorage.key(i));
                let organization = JSON.parse(jsonOrganization);
                organizations.push(organization);
            }
        }
        return organizations;
    };

    this.getStoredOrganizationProjects = function(organizationId) {
        let organizationStorageKey = ORGANIZATION_PREFIX + organizationId;
        let organization = JSON.parse(localStorage.getItem(organizationStorageKey));
        if (!organization.projects) {
            throw Error('No projects stored for organization with id: ' + organizationId);
        }
        return organization.projects;
    };

    this.getStoredProjectLists = function(organizationId, projectId) {
        let organizationStorageKey = ORGANIZATION_PREFIX + organizationId;
        let organization = JSON.parse(localStorage.getItem(organizationStorageKey));

        if (!organization.projects[projectId].lists) {
            throw Error('No lists stored for project with id: ' + projectId);
        }

        return organization.projects[projectId].lists;
    };

    this.getStoredOrganization = function(organizationId) {
        let organizationStorageKey = ORGANIZATION_PREFIX + organizationId;
        return JSON.parse(localStorage.getItem(organizationStorageKey));
    };

    this.updateRecentlySelected = function(key, value) {
        if (value) {
            let organizationId = $('#organizations-select').val();
            let projectId = $('#projects-select').val();
            let recentlySelected = {};

            switch (key) {
                case RECENTLY_SELECTED_ORGANIZATION:
                    recentlySelected.organization = value;
                    break;
                case RECENTLY_SELECTED_PROJECT:
                    recentlySelected.organization = organizationId;
                    recentlySelected.project = value;
                    break;
                case RECENTLY_SELECTED_LIST:
                    recentlySelected.organization = organizationId;
                    recentlySelected.project = projectId;
                    recentlySelected.list = value;
                    break;
                default:
                    throw new Error('Provided key is not supported');
            }

            localStorage.setItem(RECENTLY_SELECTED, JSON.stringify(recentlySelected));
        }
    };

    this.getRecentlySelected = function() {
        let recentlySelected = JSON.parse(localStorage.getItem(RECENTLY_SELECTED));
        if (!recentlySelected) {
            return {};
        }
        return recentlySelected;
    };

    this.removeStoredOrganizations = function() {
        for (let key in localStorage){
            if (key.startsWith(ORGANIZATION_PREFIX)) {
                localStorage.removeItem(key);
            }
        }
    };
}