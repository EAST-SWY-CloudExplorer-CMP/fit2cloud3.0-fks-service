ProjectApp.controller('LdapController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http) {

    // 定义搜索条件
    $scope.conditions = [
        {key: "paramKey", name: "参数名称", directive: "filter-contains"},
        {key: "paramValue", name: "参数值", directive: "filter-contains"}
    ];

    // 用于传入后台的参数
    $scope.filters = [];

    $scope.columns = [
        {value: "参数名称", key: "param_key"},// 不想排序的列，用sort: false
        {value: "参数值", key: "param_value"}
    ];

    $scope.list = function (sortObj) {
        const condition = FilterSearch.convert($scope.filters);
        if (sortObj) {
            $scope.sort = sortObj;
        }
        // 保留排序条件，用于分页
        if ($scope.sort) {
            condition.sort = $scope.sort.sql;
        }
        HttpUtils.paging($scope, "settings/ldap/listLdapParamters", condition, function () {
            console.log($scope.items);
        });
    };

    $scope.list();


    $scope.create = function () {
        $scope.item = {};
        $scope.item.type="CREATE";
        $scope.formUrl = 'project/html/settings/ldap/ldap-settings-edit.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    };

    $scope.edit = function (item) {
        $scope.item = angular.copy(item);
        $scope.item.type="UPDATE";
        $scope.formUrl = 'project/html/settings/ldap/ldap-settings-edit.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    }

    $scope.closeToggleForm = function () {
        $scope.item = {};
        $scope.toggleForm();
    };


    $scope.save = function (item) {
        HttpUtils.post("settings/ldap/createLdapParamter" ,item ,function(){
            $scope.toggleForm();
            $scope.list();
        })
    }
    
    $scope.update = function (item) {
        HttpUtils.post("settings/ldap/updateLdapParamter" ,item ,function(){
            $scope.toggleForm();
            $scope.list();
        })
    }

    $scope.delete = function(item){

        Notification.confirm("将删除ldap参数：" + item.paramKey + "，确认删除？", function () {
            HttpUtils.get("settings/ldap/deleteLdapParamter/"+item.paramKey , function () {
                Notification.success("删除成功");
                $scope.list();
            })
        });

    }




});
