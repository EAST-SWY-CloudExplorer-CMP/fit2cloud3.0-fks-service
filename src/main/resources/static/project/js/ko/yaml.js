ProjectApp.controller('RepositoryController', function ($scope, HttpUtils, FilterSearch, $http, Notification, operationArr, eyeService, $state, $stateParams, ProhibitPrompts, UserService, AuthService, Loading) {
    $scope.yamlDetailClusterId = "";
    $scope.columnsRepos = [
        {value: "应用名称", key: "name"},
        {value: "版本", key: "version"},
        // {value: "用途描述", key: "description"},
        {value: "创建时间", key: "create_time"}
    ];

    // 定义搜索条件
    $scope.conditions = [
        {key: "name", name: "名称", directive: "filter-contains"},
        {key: "version", name: "版本", directive: "filter-contains"}
    ];

    // 用于传入后台的参数
    $scope.filters = [];
    $scope.ids = [];
    // 全选按钮，添加到$scope.columns
    $scope.first = {
        default: true,
        sort: false,
        type: "checkbox",
        checkValue: false,
        change: function (checked) {
            $scope.items.forEach(function (item) {
                item.enable = checked;
            });
        },
        width: "40px"
    };
    $scope.columnsRepos.unshift($scope.first);

    // 原获取列表逻辑，不带条件查询
    // $scope.listRepos = function () {
    //     $scope.loadingLayer = HttpUtils.get("yaml/repository", function (resp) {
    //         //console.log(resp.data)
    //         $scope.items = angular.copy(resp.data);
    //         console.log("list data : " +$scope.items);
    //         $scope.$applyAsync();
    //     });
    // };

    $scope.listRepos = function (sortObj) {
        var condition = FilterSearch.convert($scope.filters);
        if (sortObj) {
            $scope.sort = sortObj;
        }
        // 保留排序条件，用于分页
        if ($scope.sort) {
            condition.sort = $scope.sort.sql;
        }
        HttpUtils.paging($scope, "yaml/repository", condition, function () {
            angular.forEach($scope.items, function (item) {
                item.enable = false;
            });
        });
    };
    $scope.listRepos();

    $scope.getBusinessKey = function () {
        $scope.businessKey = Math.random();
        $scope.loadingLayer = HttpUtils.post("yaml/businessKey", null, function (resp) {
            $scope.businessKey = resp.data;
        })
        var businessKey = $scope.businessKey;
        return businessKey;
    }

    /*编辑新增yaml*/
    $scope.showDetail = function (item,editType) {
        $scope.detail = {};
        $scope.editType = editType;
        if($scope.editType==0){
            //新建先获取主键id
            $scope.loadingLayer = HttpUtils.get("yaml/yamlCreate", function (resp) {
                console.log(resp.data);
                $scope.isSave = true;
                $scope.detail.id = angular.copy(resp.data);
                $scope.detail.description = "";
                $scope.detail.name = "";
                $scope.formUrl = 'project/html/yaml/repository_edit.html' + '?_t=' + Math.random();
                $scope.toggleForm();
                $scope.show = true;
                $scope.init();
            });
        }else{
            $scope.detail = angular.copy(item);
            $scope.isSave = false;
            $scope.formUrl = 'project/html/yaml/repository_edit.html' + '?_t=' + Math.random();
            $scope.toggleForm();
            $scope.show = true;
            $scope.init();
        }
    }

    $scope.closeToggleForm = function () {
        //针对新建不成功的 要依据主键删除记录
        if($scope.editType == 0){
            HttpUtils.post("yaml/yamlDelete", $scope.detail.id, function (r) {
                $scope.toggleForm();
            });
        }else {
            $scope.toggleForm();
        }
    };

    $scope.closeToggleForm2 = function () {
        $scope.toggleForm();
    };

    $scope.clickSave = function () {
        $scope.isSave = !$scope.isSave;
    };

    $scope.clickCancel = function () {
        $scope.isSave = !$scope.isSave;
        $scope.detail = angular.copy($scope.detail2);

    };

    $scope.init = function () {
        $scope.detail2 = angular.copy($scope.detail);
    };

    $scope.submit = function (data) {
        $scope.loadingLayer = HttpUtils.post("yaml/yamlEdit", data, function (resp) {
            if($scope.editType == 1) {
                Notification.success("编辑成功!");
            }else{
                console.log(resp.data);
                Notification.success("新增成功!");
                $scope.editType = 1;
                $scope.toggleForm();
            }
            $scope.init();
            $scope.clickSave();
            $scope.listRepos();
        });
    };

    /*部署yaml*/
    $scope.deployYaml = function (item) {
        // $scope.yamlDetail = angular.copy(item);
        $scope.noChoose = true;
        angular.forEach($scope.items, function (c) {
            if (c.enable) {
                $scope.noChoose = false;
            }
        });
        if ($scope.noChoose) {
            Notification.info("未选择操作项");
            return;
        }

        $scope.formUrl = 'project/html/yaml/repository_deploy.html' + '?_t=' + Math.random();
        $scope.listYamlClusters();
        $scope.toggleForm();
    };

    $scope.listYamlClusters = function () {
        $scope.loadingLayer = HttpUtils.get("ko/listYamlClusters", function (resp) {
            $scope.cluseterItems = angular.copy(resp.data);
        });
    };

    $scope.submit2 = function (yamlDetailClusterId) {
        // $scope.yamlDetail.yamlRepoId = $scope.yamlDetail.id;
        // $scope.yamlDetail.yamlRepoName = $scope.yamlDetail.name;
        // $scope.loadingLayer = HttpUtils.post("yaml/yamlDeploy", $scope.yamlDetail, function (resp) {
        //     console.log(resp.data);
        //     $scope.deployStatus = angular.copy(resp.data);
        //     if($scope.deployStatus){
        //         Notification.success("部署成功!");
        //     }else {
        //         Notification.error("部署失败，请前往部署结果中查看详细信息!");
        //     }
        // });
        $scope.yamlDepos = [];
        angular.forEach($scope.items, function (i) {
            if (i.enable) {
                i.clusterId = yamlDetailClusterId;
                $scope.yamlDepos.push(i);
            }
        })

        $scope.loadingLayer = HttpUtils.post("yaml/yamlDeploy", $scope.yamlDepos, function (resp) {
            console.log(resp.data);
            $scope.deployStatus = angular.copy(resp.data);
            if($scope.deployStatus){
                Notification.success("部署成功!");
            }else {
                Notification.error("部署失败，请前往部署结果中查看详细信息!");
            }
        });
    };
});

ProjectApp.controller('HistoryController', function ($scope, HttpUtils, FilterSearch, $http, Notification, operationArr, eyeService, $state, $stateParams, ProhibitPrompts, UserService, AuthService, Loading) {
    $scope.columnsHistory = [
        {value: "集群", key: "clusterName"},
        {value: "仓库名称", key: "repoName"},
        {value: "开始时间", key: "create_time"},
        {value: "结束时间", key: "finish_time"},
        {value: "状态", key: "status"},
        {value: "查看", key: "status"}
    ];

    $scope.listHistory = function () {
        $scope.loadingLayer = HttpUtils.get("yaml/history", function (resp) {
            //console.log(resp.data)
            $scope.items = angular.copy(resp.data);
            console.log("list data : " +$scope.items);
            $scope.$applyAsync();
        });
    };

    $scope.listHistory();

    /*查看部署结果*/
    $scope.showDetail = function (item) {
        $scope.detail = angular.copy(item);
        $scope.formUrl = 'project/html/yaml/history_detail.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    }

    $scope.closeToggleForm = function () {
        $scope.toggleForm();
    };
});
