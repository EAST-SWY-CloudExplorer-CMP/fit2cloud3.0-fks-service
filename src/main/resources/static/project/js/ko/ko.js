ProjectApp.controller('ClustersController', function ($scope, HttpUtils, FilterSearch, $http, Notification, operationArr, eyeService,
                                                      $state, $stateParams, ProhibitPrompts, UserService, AuthService, Loading) {
    $scope.clusters = [];

    $scope.columnsClusters = [
        {value: "名称", key: "name"},
        {value: "集群版本", key: "resource"},
        //{value: "云服务商", key: "cloud_provider"},
        {value: "部署模型", key: "template"},
        {value: "节点", key: "nodesNum"},
        {value: "组织", key: "nodesNum"},
        {value: "工作空间", key: "nodesNum"},
        {value: "来源", key: "nodesNum"},
        {value: "状态", key: "status"}
    ];

    // 全选按钮，添加到$scope.columns
    $scope.first = {
        default: true,
        sort: false,
        type: "checkbox",
        checkValue: false,
        change: function (checked) {
            $scope.clusters.forEach(function (item) {
                item.enable = checked;
            });
        },
        width: "40px"
    };
    $scope.columnsClusters.unshift($scope.first);

    $scope.params = {};
    $scope.params.accountId = 'all';

    //获取cmp的集群
    $scope.getClusterList = function () {
        $scope.clusterParam = {};
        if ($scope.params.accountId !== 'all') {
            $scope.clusterParam.accountId = $scope.params.accountId;
        }
        $scope.loadingLayer = HttpUtils.post("dashboard/cluster", $scope.clusterParam, function (response) {
            angular.forEach(response.data, function (data) {
                if (data.status == "VALID") {
                    data.status = "运行中";
                } else {
                    data.status = "异常";
                }
                $scope.clusters.push(data);
            });

            //查询ko存量接入部分
            HttpUtils.post("cluster/query/koClusters", null, function (response) {
                if (response && response.data) {
                    angular.forEach(response.data, function (ko) {
                        var koCluster = {};
                        koCluster.cloudAccountId = ko.cloudAccountId;
                        koCluster.cloudAccountName = ko.cloudAccountName;
                        koCluster.version = ko.version;
                        koCluster.deployType = ko.deployType;
                        koCluster.node = ko.node;
                        koCluster.resourceType = ko.resourceType;
                        if (ko.status == "RUNNING") {
                            koCluster.status = "运行中";
                        }
                        $scope.clusters.push(koCluster);
                    });
                }
                console.log("query koClusters:" + response.data);

                angular.forEach($scope.clusters, function (cluster) {
                    HttpUtils.post("cluster/query/auth", cluster.cloudAccountId, function (response) {
                        if (response.data != null && response.data != undefined) {
                            cluster.organizationName = response.data.organizationName;
                            cluster.workspaceName = response.data.workspaceName;
                        }
                    });
                });
            });
        });
    };
    $scope.getClusterList();

    //获取ko存量接入的集群并保存
    $scope.syncKoClusters = function () {
        $scope.koClusters = [];
        $scope.loadingLayer = HttpUtils.get("ko/clusters", function (resp) {
            $scope.koItems = angular.copy(resp.data);

            angular.forEach($scope.koItems, function (ko) {
                var kocluster = {};
                kocluster.cloudAccountId = ko.id;
                kocluster.cloudAccountName = ko.name;
                kocluster.version = "v" + ko.resource_version;
                kocluster.deployType = ko.template;
                kocluster.node = ko.nodesNum + "";
                kocluster.resourceType = "存量接入";
                kocluster.status = ko.status;
                $scope.koClusters.push(kocluster);
            });

            HttpUtils.post("cluster/save/koClusters", $scope.koClusters, function (response) {
                console.log("save koClusters success :" + response.data);
            });
        });
        $state.reload();
    };

    $scope.showDetail = function (item,selind) {
        $scope.detail = angular.copy(item);
        $scope.selectedIndex = selind;
        $scope.formUrl = 'project/html/ko/cluster.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    };

    $scope.authorizeCluster = function (item) {
        $scope.item = {};
        $scope.item = item;

        $scope.noChoose = true;
        angular.forEach($scope.clusters, function (c) {
            if (c.enable) {
                $scope.noChoose = false;
            }
        });
        if ($scope.noChoose) {
            Notification.info("未选择操作项");
            return;
        }
        $scope.formUrl = 'project/html/ko/authorizeCluster.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    };

    $scope.closeToggleForm = function () {
        $scope.toggleForm();
    };

    $scope.acquisitionConditions = function () {
        HttpUtils.get("cluster/organizations", function (rep) {
            $scope.orgs = rep.data;
        });
    };
    $scope.acquisitionConditions();

    $scope.changeWorkspaces = function (organizationId) {
        HttpUtils.get("cluster/org/" + organizationId, function (rep) {
            $scope.workspaces = rep.data;
        });
    };

    $scope.authes = [
        {authType: "1" , name:"授权到工作空间"}
    ];

    $scope.authItem = {};

    $scope.saveAuth = function (authItem) {
        var success = 0;
        angular.forEach($scope.$parent.clusters, function (checkedCluster) {
            if (checkedCluster.enable) {
                var authReq = {};
                authReq.organizationId = authItem.organizationId;
                authReq.workspaceId = authItem.workspaceId;
                angular.forEach($scope.orgs, function (org) {
                    if (authReq.organizationId == org.id) {
                        authReq.organizationName = org.name;
                    }
                });
                angular.forEach($scope.workspaces, function (workspace) {
                    if (authReq.workspaceId == workspace.id) {
                        authReq.workspaceName = workspace.name;
                    }
                });
                authReq.cloudAccountName = checkedCluster.cloudAccountName;
                authReq.cloudAccountId = checkedCluster.cloudAccountId;

                HttpUtils.post("cluster/save/auth", authReq, function (response) {
                    console.log("save success :" + response.data);
                    success++;
                });
            }
        });
        Notification.info("保存成功");
        $scope.getClusterList();
        $state.reload();
        $scope.closeToggleForm();
    }

});

ProjectApp.controller('ClusterController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ) {

});

ProjectApp.controller('ClusterInfoController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ) {

});

ProjectApp.controller('ClusterNodesController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ) {
    $scope.columns = [
        {value: "名称" , key:"name" , sort:false},
        {value: "IP" ,key: "ip" , sort:false},
        {value: "CPU(核)" ,key: "host_cpu_core" , sort:false},
        {value: "内存(MB)" ,key: "host_memory" , sort:false},
        {value: "操作系统" ,key: "os" , sort:false},
        {value: "角色" ,key: "roles" , sort:false}
    ];

    $scope.list = function () {
        $scope.loadingLayer = HttpUtils.get("ko/clusters/"+$scope.detail.name+"/nodes/", function (resp) {
            $scope.items = angular.copy(resp.data);
            console.log($scope.items);
        });
    };

    $scope.list();
});

ProjectApp.controller('DashboardController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ) {
    //$scope.background = "/web-public/fit2cloud/html/background/background.html?_t" + window.appversion;
    $scope.searchClusters = [
        {id: "all", name: "全部集群"}
    ];
    $scope.params = {};
    $scope.params.accountId = 'all';

    $scope.getSearchClusters = function () {
        HttpUtils.get("cluster/condition/list", function (response) {
            $scope.searchClusters = [
                {id: "all", name: "全部集群"}
            ];
            for (let i = 0; i < response.data.length; i++) {

                $scope.searchClusters.push({
                    "id": response.data[i].cloudAccountId,
                    "name": response.data[i].cloudAccountName
                });
            }
        })
    };
    $scope.getSearchClusters();

    $scope.clusterChange = function () {
        if ($scope.params.accountId !== 'all') {
            $scope.clusterStateChart.param.accountId = $scope.params.accountId;
            $scope.masterStateChart.param.accountId = $scope.params.accountId;
            $scope.workerStateChart.param.accountId = $scope.params.accountId;
        }
        // $scope.podStateChart.execute();
        // $scope.containerStateChart.execute();
        $scope.clusterStateChart.execute();
        $scope.masterStateChart.execute();
        $scope.workerStateChart.execute();

        $scope.initDashboard();
    };

    // $scope.podStateChart = {
    //     name: 'Pod状态',
    //     label: {position: 'outside'},
    //     url: "dashboard/pod/state",
    //     param: {},
    // };
    //
    // $scope.containerStateChart = {
    //     name: '容器状态',
    //     label: {position: 'outside'},
    //     url: "dashboard/container/state",
    //     param: {},
    // };

    $scope.clusterStateChart = {
        name: '集群运行状态',
        label: {position: 'outside'},
        url: "dashboard/cluster/state",
        param: {},
    };

    $scope.masterStateChart = {
        name: 'master运行状态',
        label: {position: 'outside'},
        url: "dashboard/master/state",
        param: {},
    };

    $scope.workerStateChart = {
        name: 'worker运行状态',
        label: {position: 'outside'},
        url: "dashboard/worker/state",
        param: {},
    };

    $scope.initDashboard = function () {
        // $scope.loadingLayer = HttpUtils.get("ko/dashboard/", function (resp) {
        //     $scope.items = angular.copy(resp.data);
        //     console.log($scope.items);
        // });
        $scope.getClusters();
    };

    $scope.getClusters = function () {
        $scope.clusterParam = {};
        if ($scope.params.accountId !== 'all') {
            $scope.clusterParam.accountId = $scope.params.accountId;
        }
        $scope.loadingLayer = HttpUtils.post("dashboard/cluster", $scope.clusterParam, function (response) {
            $scope.clusters = response.data;

            $scope.getContainerInfo();
        });
    };

    $scope.getContainerInfo = function () {
        $scope.getEtcdServices();
        $scope.getApiServices();
        $scope.getSchedulerServices();
        $scope.getControllerManagerServices();
        // $scope.getDockerServices();
        // $scope.getKubeletServices();
        $scope.getProxyServices();
    };

    $scope.getEtcdServices = function () {
        $scope.etcdServices = [];
        angular.forEach($scope.clusters, function (cluster) {
            var etcd = {};
            etcd.serviceName = "etcd服务";
            etcd.cloudAccountId = cluster.cloudAccountId;
            $scope.etcdReq = {};
            $scope.etcdReq.nodeType = "etcd";
            $scope.etcdReq.cloudAccountId = cluster.cloudAccountName;

            HttpUtils.post("dashboard/container/etcd", $scope.etcdReq, function (response) {
                etcd.normalNum = response.data.normalNum;
                etcd.abnormalNum = response.data.abnormalNum;
                $scope.etcdServices.push(etcd);
            });
        });
    };

    $scope.getApiServices = function () {
        $scope.apiServices = [];
        angular.forEach($scope.clusters, function (cluster) {
            var api = {};
            api.serviceName = "API服务";
            api.cloudAccountId = cluster.cloudAccountId;
            $scope.apiReq = {};
            $scope.apiReq.nodeType = "apiserver";
            $scope.apiReq.cloudAccountId = cluster.cloudAccountName;

            HttpUtils.post("dashboard/container/api", $scope.apiReq, function (response) {
                api.normalNum = response.data.normalNum;
                api.abnormalNum = response.data.abnormalNum;

                $scope.apiServices.push(api);
            });
        });
    };

    $scope.getSchedulerServices = function () {
        $scope.schedulerServices = [];
        angular.forEach($scope.clusters, function (cluster) {
            var scheduler = {};
            scheduler.serviceName = "Scheduler服务";
            scheduler.cloudAccountId = cluster.cloudAccountId;
            $scope.schedulerReq = {};
            $scope.schedulerReq.nodeType = "scheduler";
            $scope.schedulerReq.cloudAccountId = cluster.cloudAccountName;

            HttpUtils.post("dashboard/container/scheduler", $scope.schedulerReq, function (response) {
                scheduler.normalNum = response.data.normalNum;
                scheduler.abnormalNum = response.data.abnormalNum;
                $scope.schedulerServices.push(scheduler);
            });
        });
    };

    $scope.getControllerManagerServices = function () {
        $scope.controllerManagerServices = [];
        angular.forEach($scope.clusters, function (cluster) {
            var controllerManager = {};
            controllerManager.cloudAccountId = cluster.cloudAccountId;
            controllerManager.serviceName = "Controller-Manager服务";

            $scope.controllerManagerReq = {};
            $scope.controllerManagerReq.nodeType = "controller-manager";
            $scope.controllerManagerReq.cloudAccountId = cluster.cloudAccountName;
            HttpUtils.post("dashboard/container/controllerManager", $scope.controllerManagerReq, function (response) {
                controllerManager.normalNum = response.data.normalNum;
                controllerManager.abnormalNum = response.data.abnormalNum;
                $scope.controllerManagerServices.push(controllerManager);
            });
        });
    };

    $scope.getDockerServices = function () {
        $scope.dockerServices = [];
        angular.forEach($scope.clusters, function (cluster) {
            var docker = {};
            docker.cloudAccountId = cluster.cloudAccountId;
            docker.serviceName = "docker服务";

            $scope.dockerReq = {};
            $scope.dockerReq.nodeType = "docker";
            $scope.dockerReq.cloudAccountId = cluster.cloudAccountName;
            HttpUtils.post("dashboard/container/docker", $scope.dockerReq, function (response) {
                docker.normalNum = response.data.normalNum;
                docker.abnormalNum = response.data.abnormalNum;

                $scope.dockerServices.push(docker);
            });
        });
    };

    $scope.getKubeletServices = function () {
        $scope.kubeletServices = [];
        angular.forEach($scope.clusters, function (cluster) {
            var kubelet = {};
            kubelet.cloudAccountId = cluster.cloudAccountId;
            kubelet.serviceName = "kubelet服务";

            $scope.kubeletReq = {};
            $scope.kubeletReq.nodeType = "kubelet";
            $scope.kubeletReq.cloudAccountId = cluster.cloudAccountName;
            HttpUtils.post("dashboard/container/kubelet", $scope.kubeletReq, function (response) {
                kubelet.normalNum = response.data.normalNum;
                kubelet.abnormalNum = response.data.abnormalNum;

                $scope.kubeletServices.push(kubelet);
            });
        });
    };

    $scope.getProxyServices = function () {
        $scope.proxyServices = [];
        angular.forEach($scope.clusters, function (cluster) {
            var proxy = {};
            proxy.cloudAccountId = cluster.cloudAccountId;
            proxy.serviceName = "proxy服务";

            $scope.proxyReq = {};
            $scope.proxyReq.nodeType = "proxy";
            $scope.proxyReq.cloudAccountId = cluster.cloudAccountName;
            HttpUtils.post("dashboard/container/proxy", $scope.proxyReq, function (response) {
                proxy.normalNum = response.data.normalNum;
                proxy.abnormalNum = response.data.abnormalNum;

                $scope.proxyServices.push(proxy);
            });
        });
    };

    // $scope.initDashboard();
});
