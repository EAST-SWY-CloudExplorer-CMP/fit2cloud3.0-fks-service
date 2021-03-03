ProjectApp.controller('AppGroupController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ,UserService) {

    // 定义搜索条件
    $scope.conditions = [
        {key: "realmName", name: "应用组名称", directive: "filter-contains"},
        {
            key: "enabled",
            name: "账号状态",
            directive: "filter-select", // 使用哪个指令
            selects: [
                {value: true, label: "启用"},
                {value: false, label: "禁用"}
            ]
        }, {
            key: "sslRequired",
            name: "是否需要https",
            directive: "filter-select",
            selects: [
                {value: "none", label: "无需https"},
                {value: "external", label: "外部请求需要https"},
                {value: "all", label: "所有请求需要https"}
            ]
        }

    ];

    if ($scope.currentRole === $scope.roleConst.admin) {
        $scope.conditions.push({
            key: "organizationId",
            name: "组织",
            directive: "filter-select-virtual",
            url: "organization/listAllOrganizations",
            search: true,
            convert: {value: "id", label: "name"}
        })
    }

    // 用于传入后台的参数
    $scope.filters = [];

    $scope.columns = [
        {value: "应用组名称", key: "realmName"},// 不想排序的列，用sort: false
        {value: "是否启用", key: "enabled" , sort:false},
        {value: "组织" , key: "organizations" , sort:false},
        {value: "用户组" , key: "ssoLdapGroups" , sort:false},
        {value: "应用" , key: "clientCount" ,sort:false},
        {value: "是否需要https" , key: "sslRequired" , sort:false}
    ];

    $scope.enableList = [
        {id:true , name:"启用"},
        {id:false, name:"禁用"}
    ];

    $scope.sslRequiredList=[
        {id:"none" , name:"无需https"},
        {id:"external", name:"外部请求需要https"},
        {id:"all", name:"所有请求需要https"}
    ];

    $scope.isOrgAdmin = UserService.isOrgAdmin();


    $scope.list = function (sortObj) {
        const condition = FilterSearch.convert($scope.filters);
        console.log(condition);
        if (sortObj) {
            $scope.sort = sortObj;
        }
        // 保留排序条件，用于分页
        if ($scope.sort) {
            condition.sort = $scope.sort.sql;
        }
        HttpUtils.paging($scope, "application/group/listKeycloakRealms", condition, function () {
            console.log($scope.items);
        });
    };

    $scope.list();


    $scope.acquisitionConditions = function () {
        if ($scope.currentRole === $scope.roleConst.orgAdmin) {
            HttpUtils.get("organization/currentOrganizations", function (rep) {
                $scope.orgs = rep.data;
            });
        } else {
            HttpUtils.get("organization/listAllOrganizations", function (rep) {
                $scope.orgs = rep.data;
            });
        }
    };

    $scope.acquisitionConditions();

    $scope.create = function () {
        $scope.item = {};
        $scope.formUrl = 'project/html/application/group/app-group-add.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    };

    $scope.save = function (item) {
        console.log(item);
        HttpUtils.post("application/group/addKeycloakRealm" ,item ,function(){
            $scope.toggleForm();
            $scope.list();
        })
    }

    $scope.edit = function (item) {
        $scope.item = angular.copy(item);
        $scope.item.organizationIds = [] ;
        $scope.item.userGroupDns = [] ;
        console.log(item);
        if (item.organizations) {
            angular.forEach(item.organizations ,function(organization){
                $scope.item.organizationIds.push(organization.id);
            })
        }
        if (item.ssoLdapGroupList) {
            angular.forEach(item.ssoLdapGroupList ,function(ssoLdapGroup){
                $scope.item.userGroupDns.push(ssoLdapGroup.dn);
            })
        }
        console.log($scope.item.userGroupDns);

        $scope.formUrl = 'project/html/application/group/app-group-update.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    }

    $scope.closeToggleForm = function () {
        $scope.item = {};
        $scope.toggleForm();
    };


    $scope.update = function (item) {
        HttpUtils.post("application/group/updateKeycloakRealm" ,item ,function(){
            $scope.toggleForm();
            $scope.list();
        })
    }

    $scope.delete = function(item){
        Notification.confirm("将删除应用组：" + item.realmName + "，确认删除？", function () {
            HttpUtils.get("application/group/deleteKeycloakRealm/"+item.realmId , function () {
                Notification.success("删除成功");
                $scope.list();
            })
        });
    }

    $scope.selectLdapGroupByOrganizationId = function(){
        HttpUtils.get("user/group/selectLdapGroupByOrganizationId" , function (response) {
            $scope.ldapGroups = response.data;
            console.log($scope.ldapGroups);
        })
    }

    $scope.selectLdapGroupByOrganizationId();


    $scope.sync = function () {
        $scope.loadingLayer = HttpUtils.post("application/group/sync" , {} , function () {
            $scope.list();
            Notification.success("同步成功！");
        } , function (resp) {
            Notification.danger(resp.message);
        })
    }

    $scope.showApps = function(item){
        $scope.realmId = item.realmId;
        $scope.formUrl = 'project/html/application/group/app-group-apps.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    }

    $scope.showUsers = function(item){
        $scope.realmId = item.realmId;
        $scope.formUrl = 'project/html/application/group/app-group-users.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    }


});

ProjectApp.controller('AppGroupAppsController', function ($scope, HttpUtils) {

    $scope.columns = [
        {value: "应用id" , key: "clientId" , sort:false},
        {value: "应用名称" ,key: "name" , sort:false},
        {value: "是否可用" ,key: "enabled" , sort:false},
    ];

    $scope.list = function(){
        HttpUtils.paging($scope, "application/app/listSsoKeycloakClients" , {realmId:$scope.realmId})
    };

    $scope.list();

});

ProjectApp.controller('AppGroupUsersController', function ($scope, HttpUtils,FilterSearch,Notification) {

    // 定义搜索条件
    $scope.conditions = [
        {key: "username", name: "用户名", directive: "filter-contains"}
    ];

    // 用于传入后台的参数
    $scope.filters = [];

    $scope.columns = [
        {value: "用户名" , key: "username" , sort:false},
        {value: "MFA开启状态" , key:"status" , sort:false},
        {value: "操作" ,key: "operation" , sort:false},
    ];


    $scope.list = function (sortObj) {
        const condition = FilterSearch.convert($scope.filters);
        condition.realmId = $scope.realmId;
        console.log(condition);
        if (sortObj) {
            $scope.sort = sortObj;
        }
        // 保留排序条件，用于分页
        if ($scope.sort) {
            condition.sort = $scope.sort.sql;
        }
        HttpUtils.paging($scope, "application/group/listKeycloakUsers", condition, function () {
            console.log($scope.items);
        });
    };

    $scope.list();

    $scope.openMFA = function(item){
        $scope.requestParam = angular.copy(item);
        $scope.requestParam.realmId = $scope.realmId;
        $scope.loadingLayer = HttpUtils.post('application/group/openMFA' ,$scope.requestParam , function () {
            Notification.success("MFA开启成功！");
            $scope.list();
        } ,function (resp) {
            Notification.danger(resp.message);
            $scope.list();
        })
    }

    $scope.closeMFA = function(item){
        $scope.requestParam = angular.copy(item);
        $scope.requestParam.realmId = $scope.realmId;
        $scope.loadingLayer = HttpUtils.post('application/group/closeMFA' ,$scope.requestParam , function () {
            Notification.success("MFA关闭成功！");
            $scope.list();
        } ,function (resp) {
            Notification.danger(resp.message);
            $scope.list();
        })
    }

    $scope.resetMFA = function(item){
        $scope.requestParam = angular.copy(item);
        $scope.requestParam.realmId = $scope.realmId;
        $scope.loadingLayer = HttpUtils.post('application/group/resetMFA' ,$scope.requestParam , function () {
            Notification.success("MFA重置成功！");
            $scope.list();
        } ,function (resp) {
            Notification.danger(resp.message);
            $scope.list();
        })
    }

});