function CardFormRenderer(BackgroundMessageSender, DataRepository) {

    const RESOURCE_TYPE_ORGANIZATIONS = 'organizations';
    const RESOURCE_TYPE_PROJECTS = 'organizationProjects';
    const RESOURCE_TYPE_LISTS = 'projectLists';

    this.DataRepository = DataRepository;
    this.BackgroundMessageSender = BackgroundMessageSender;
    this.organizationsSelector = $('#organizations-select');
    this.projectsSelector = $('#projects-select');
    this.listsSelector = $('#lists-select');
    var self = this;

    this.bindSelectEvents = function() {
        this.bindOrganizationsOnClick();
        this.bindOrganizationsOnSelect();
        this.bindProjectsOnSelect();
        this.bindListsOnSelect();
        this.bindCreateCardFormSubmit();
        this.bindRefreshButtonClick();
    };

    this.bindOrganizationsOnClick = function () {
        this.organizationsSelector.on('select2:opening', function(e) {
            let storedOrganizations = self.DataRepository.getStoredOrganizations();
            if (storedOrganizations.length === 0) {
                let message = {
                    action: 'fetchResource',
                    type: RESOURCE_TYPE_ORGANIZATIONS
                };
                self.BackgroundMessageSender.sendBackgroundMessageWithCallback(message, self.organizationsClickMessageCallback);
            }
        });
    };

    this.organizationsClickMessageCallback = function(response) {
        let organizations = response.data;
        self.renderOrganizationsDynamically(organizations);
    };

    this.bindOrganizationsOnSelect = function() {
        this.organizationsSelector.change(function(e) {
            let targetOrganizationId = this.value;

            try {
                self.DataRepository.getStoredOrganizationProjects(targetOrganizationId);
                let targetOrganization = self.DataRepository.getStoredOrganization(targetOrganizationId);
                let defaultProjectId = Object.keys(targetOrganization.projects)[0];
                self.renderProjects(targetOrganization.projects, defaultProjectId);
                self.renderLists(targetOrganization.projects[defaultProjectId].lists);
                self.DataRepository.updateRecentlySelected('organization', targetOrganizationId);
            } catch (err) {
                let message = {
                    action: 'fetchResource',
                    organizationId: targetOrganizationId,
                    type: RESOURCE_TYPE_PROJECTS,
                };
                self.projectsSelector.prop('disabled', 'disabled');
                self.BackgroundMessageSender.sendBackgroundMessageWithCallback(message, self.organizationsSelectMessageCallback);
            }
        });
    };

    this.organizationsSelectMessageCallback = function(response) {
        let projects = response.data;
        self.renderProjects(projects);
        self.projectsSelector.prop('disabled', false);

        let projectId = Object.keys(projects)[0];
        self.projectsSelector.val(projectId).trigger('change');
    };

    this.bindProjectsOnSelect = function() {
        self.projectsSelector.change(function(e) {
            let selectedOrganizationId = self.getSelectedOrganizationId();
            let selectedProjectId = e.target.value;

            try {
                let lists = self.DataRepository.getStoredProjectLists(selectedOrganizationId, selectedProjectId);
                self.renderLists(lists);
                self.DataRepository.updateRecentlySelected('project', selectedProjectId);
            } catch(err) {
                let message = {
                    action: 'fetchResource',
                    type: RESOURCE_TYPE_LISTS,
                    organizationId: selectedOrganizationId,
                    projectId: selectedProjectId,
                };

                self.listsSelector.prop('disabled', 'disabled');
                self.BackgroundMessageSender.sendBackgroundMessageWithCallback(message, self.projectsSelectMessageCallback);
            }
        });
    };

    this.projectsSelectMessageCallback = function(response) {
        let lists = response.data;
        self.renderLists(lists);
        self.listsSelector.prop('disabled', false);
    };

    this.bindListsOnSelect = function() {
        self.listsSelector.change(function(e) {
            let selectedListId = e.target.value;
            self.DataRepository.updateRecentlySelected('list', selectedListId);
        });
    };

    this.getSelectedOrganizationId = function () {
        return self.organizationsSelector.val();
    };

    this.bindCreateCardFormSubmit = function() {
        var createCardSelector = $('#create-card-form');
        createCardSelector.submit(function(event) {
            event.preventDefault();
            let formValues = createCardSelector.serializeArray();
            let card = {};
            formValues.forEach(function(field){
                if (field.name === 'project') {
                    card.projectId = field.value;
                }
                if (field.name === 'list') {
                    card.taskListId = field.value;
                }
                if (field.name === 'title') {
                    card.name = field.value;
                }
                if (field.name === 'description') {
                    card.description = field.value;
                }

            });
            let message = {
                action: 'createCard',
                card: card
            };
            self.BackgroundMessageSender.sendBackgroundMessage(message);
        });
    };

    this.hideCreateCardForm = function() {
        $('#create-card-form').hide();
    };

    this.renderCardForm = function(organizations, selectedOrganizationId, selectedProjectId, selectedListId) {
        this.setDefaultBodyHeight();
        let selectedOrganization = {};
        if (selectedOrganizationId) {
            selectedOrganization = self.DataRepository.getStoredOrganization(selectedOrganizationId);
        } else {
            selectedOrganization = organizations[0];
        }

        this.renderOrganizations(organizations, selectedOrganizationId);
        if (selectedOrganization.projects) {
            let organizationProjects = selectedOrganization.projects;
            if (!selectedProjectId) {
                let defaultKey = Object.keys(organizationProjects)[0];
                selectedProjectId = defaultKey;
            }
            this.renderProjects(organizationProjects, selectedProjectId);

            if (organizationProjects[selectedProjectId].lists) {
                this.renderLists(organizationProjects[selectedProjectId].lists, selectedListId);
            }
        }
    };

    this.renderOrganizations = function(organizations, selectedOrganizationId) {
        self.organizationsSelector.empty();
        if (organizations) {
            organizations.forEach(function(item) {
                self.organizationsSelector.append(`<option value="${item.id}">${item.name}</option>`);
            });

            if (selectedOrganizationId) {
                self.organizationsSelector.val(selectedOrganizationId);
            }
        }
    };

    this.renderProjects = function(projects, selectedProjectId) {
        self.projectsSelector.empty();
        if (projects) {
            Object.keys(projects).forEach(key => {
                let item = projects[key];
                self.projectsSelector.append(`<option value="${key}">${item.name}</option>`);
            });

            if (selectedProjectId) {
                self.projectsSelector.val(selectedProjectId);
            }
        }
    };

    this.renderLists = function(lists, selectedListId) {
        self.listsSelector.empty();
        if (lists) {
            lists.forEach(list => {
                self.listsSelector.append(`<option value="${list.id}">${list.name}</option>`);
            });
        }

        if (selectedListId) {
            self.listsSelector.val(selectedListId);
        }
    };

    /**
     * Dirty hack - select2 lib does not support dynamically adding options to opened dropdown :/
     */
    this.renderOrganizationsDynamically = function(organizations) {
        let options = self.organizationsSelector.data('select2').options.options; //save current config
        self.organizationsSelector.html(''); //delete all items

        let select2Items = [];
        organizations.forEach(item => {
            self.organizationsSelector.append(`<option value="${item.id}">${item.name}</option>`);
            select2Items.push({
                'id': item.id,
                'text': item.name,
            })
        });

        //add new items
        options.data = select2Items;
        self.organizationsSelector.select2(options);
        self.organizationsSelector.select2('open');
        self.organizationsSelector.change();
    };

    this.disableEmptySelects = function () {
        self.projectsSelector.prop('disabled', 'disabled');
        self.listsSelector.prop('disabled', 'disabled');
    };

    this.initSearchSelect = function() {
        let selectParams =
            {
                width: '270',
                containerCss: {
                    'font-weight': '600',
                    'font-family': 'Varela Round, sans-serif',
                },
                dropdownCss: {
                    'font-weight': '600',
                    'font-family': 'Varela Round, sans-serif',
                    'max-height': '190px',
                },
                sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
            };


        $('#organizations-select').select2(selectParams);
        $('#projects-select').select2(selectParams);
        $('#lists-select').select2(selectParams);
    };

    this.setDefaultBodyHeight = function () {
        $('body').css('height', '450px');
    };

    this.clearSelects = function() {
        $('#organizations-select').val(null).trigger('change');
        $('#projects-select').val(null).trigger('change');
        $('#lists-select').val(null).trigger('change');
    };

    this.bindRefreshButtonClick = function() {
        $('#refresh-data-button').on('click', function(e) {
            self.DataRepository.removeStoredOrganizations();
            self.clearSelects();
            self.disableEmptySelects();
        });
    }
}
