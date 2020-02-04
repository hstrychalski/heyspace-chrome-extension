function DataStorage () {

    const ORGANIZATION_PREFIX = 'hs-organization-';
    const LAST_SYNC_TIMESTAMP_KEY = 'hs-synced-at';

    this.saveOrganizations = function(organizations) {
        return new Promise(resolve => {
            organizations.forEach(function(item) {
                localStorage.setItem(ORGANIZATION_PREFIX + item.id, JSON.stringify(item));
            });
            resolve();
        });
    };

    this.saveOrganizationProjects = function(organizationId, projects) {
        return new Promise(resolve => {
            let organization = JSON.parse(localStorage.getItem(ORGANIZATION_PREFIX + organizationId));
            organization.projects = projects;
            localStorage.setItem(ORGANIZATION_PREFIX + organizationId, JSON.stringify(organization));
            resolve();
        });
    };

    this.saveProjectLists = function(organizationId, projectId, lists) {
        let organization = JSON.parse(localStorage.getItem(ORGANIZATION_PREFIX + organizationId));
        organization.projects[projectId].lists = lists;
        localStorage.setItem(ORGANIZATION_PREFIX + organizationId, JSON.stringify(organization));
    };

    this.setLastSyncDate = function(date) {
        if (!date) {
            date = new Date().getTime();
        }
        localStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, date);
    };
}