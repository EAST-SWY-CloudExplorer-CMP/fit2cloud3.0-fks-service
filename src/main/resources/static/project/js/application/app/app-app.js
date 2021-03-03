ProjectApp.controller('AppAppController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ,$timeout) {

    // 定义搜索条件
    $scope.conditions = [
        {key: "clientId", name: "应用ID", directive: "filter-contains"},
        {key: "name", name: "应用名称", directive: "filter-contains"},
        {
            key: "enabled",
            name: "是否可用",
            directive: "filter-select", // 使用哪个指令
            selects: [
                {value: true, label: "是"},
                {value: false, label: "否"}
            ]
        },
        {
            key: "realmId",
            name: "所属应用组",
            directive: "filter-select-virtual",
            url: "application/group/listAllKeycloakRealms",
            search: true,
            convert: {value: "realmId", label: "realmName"}
        }

    ];


    // 用于传入后台的参数
    $scope.filters = [];

    $scope.columns = [
        {value: "应用ID", key: "clientId"},// 不想排序的列，用sort: false
        {value: "应用名称", key: "name" },
        {value: "是否可用" , key: "enabled" },
        {value: "Base URL" , key: "baseUrl"},
        {value: "所属应用组" , key: "ssoKeycloakRealmId"}
    ];

    $scope.protocolList = [
        {id:"openid-connect" , name:"openid-connect"},
        {id:"saml", name:"saml"}
    ];

    $scope.enableList = [
        {id:true , name:"是"},
        {id:false, name:"否"}
    ];

    $scope.accessTypes = [
        {id:"confiential" , name:"confiential"},
        {id:"public" , name:"public"},
        {id:"bearer-only" , name:"bearer-only"}
    ]

    $scope.getKeycloakRealms = function(){
        HttpUtils.get( "application/group/listAllKeycloakRealms"  ,function(response){
            $scope.keycloakRealms = response.data;
        })
    }
    $scope.getKeycloakRealms();





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
        HttpUtils.paging($scope, "application/app/listSsoKeycloakClients", condition, function () {
            console.log($scope.items);
        });
    };

    $scope.list();


    $scope.wizard = {
        setting: {
            title: "标题",
            subtitle: "子标题",
            closeText: "取消",
            submitText: "保存",
            nextText: "下一步",
            prevText: "上一步"
        },
        // 按顺序显示,id必须唯一并需要与页面中的id一致，select为分步初始化方法，next为下一步方法(最后一步时作为提交方法)
        steps: [
            {
                id: "1",
                name: "基本信息",
                select: function () {
                },
                next: function () {
                    if (!$scope.item.realmId) {
                        Notification.info("应用组ID不能为空");
                        return false;
                    }
                    if (!$scope.item.clientId) {
                        Notification.info("应用ID不能为空");
                        return false;
                    }
                    if (!$scope.item.protocol) {
                        Notification.info("协议不能为空");
                        return false;
                    }
                    if ($scope.item.enabled == null) {
                        Notification.info("是否可用不能为空");
                        return false;
                    }
                    return true;
                }
            },
            {
                id: "2",
                name: "设置应用",
                select: function () {
                },
                next: function () {
                    if (!$scope.item.accessType) {
                        Notification.info("连接方式不可为空");
                        return false;
                    }
                    if (!$scope.item.redirectUris) {
                        Notification.info("可用目标地址不可为空");
                        return false;
                    }
                    if ($scope.item.type === 'create') {
                        HttpUtils.post("application/app/addSsoKeycloakClient", $scope.item, function () {
                            Notification.success("创建成功");
                            $scope.closeToggleForm();
                            $scope.show = false;
                            $scope.list();
                        }, function (response) {
                            Notification.danger(response.message);
                        });
                    }
                    if ($scope.item.type === 'update') {
                    if ($scope.item.type === 'update') {
                        console.log($scope.item);
                        HttpUtils.post("application/app/updateSsoKeycloakClient", $scope.item, function () {
                            Notification.success("更新成功");
                            $scope.closeToggleForm();
                            $scope.show = false;
                            $scope.list();
                        }, function (response) {
                            Notification.danger(response.message);
                        });
                    }
                }
            }
            }
        ],
        // 嵌入页面需要指定关闭方法
        close: function () {
            $scope.closeToggleForm();
            $scope.show = false;
        }
    };

    $scope.showElements = true;
    $scope.onAccessTypeChange = function(accessType){
        if (accessType === 'bearer-only') {
            $scope.showElements = false;
        }else{
            $scope.showElements = true;
        }
    }

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
        $scope.item.type = 'create' ;
        $scope.formUrl = 'project/html/application/app/app-app-edit.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    };


    $scope.update = function (item) {
        $scope.item = angular.copy(item);
        $scope.item.type = 'update' ;
        $scope.formUrl = 'project/html/application/app/app-app-edit.html' + '?_t=' + Math.random();
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
        if (item.organizations) {
            angular.forEach(item.organizations ,function(organization){
                $scope.item.organizationIds.push(organization.id);
            })
        }

        $scope.formUrl = 'project/html/application/group/app-group-update.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    }

    $scope.closeToggleForm = function () {
        $scope.item = {};
        $scope.toggleForm();
    };


    // $scope.update = function (item) {
    //     HttpUtils.post("application/group/updateKeycloakRealm" ,item ,function(){
    //         $scope.toggleForm();
    //         $scope.list();
    //     })
    // }

    $scope.delete = function(item){
        Notification.confirm("将删除应用：" + item.clientId + "，确认删除？", function () {
            HttpUtils.post("application/app/deleteSsoKeycloakClient", item , function () {
                Notification.success("删除成功");
                $scope.list();
            })
        });
    }


    $scope.setCredentials = function (item) {

        HttpUtils.get("application/app/getKeycloakClientCredential/"+item.id ,function (response) {
            $scope.openGenerateAndDownloadCredential = false ;
            $scope.isSave = false ;
            $scope.keycloakClientCredential = response.data;
            console.log(response.data);
            $scope.item = angular.copy($scope.keycloakClientCredential);
            $scope.formUrl = 'project/html/application/app/app-app-credential.html' + '?_t=' + Math.random();
            $scope.toggleForm();
            $scope.show = true;
        })

    }

    $scope.listKeycloakClientsAuthType = function () {
        HttpUtils.get("application/app/listKeycloakClientsAuthType",function (response) {
            $scope.authTypes = response.data;
        })
    }
    $scope.listKeycloakClientsAuthType();


    $scope.listKeycloakClientsArchiveFormat = function () {
        HttpUtils.get("application/app/listKeycloakClientsArchiveFormat",function (response) {
            $scope.archiveFormats = response.data;
        })
    }
    $scope.listKeycloakClientsArchiveFormat();




    $scope.getClientSecret = function(){
        HttpUtils.post("application/app/getClientSecret" , $scope.item , function (response) {
            $scope.item.secretKey = response.data;
        })
    }

    $scope.generateClientSecret = function(){
        console.log($scope.clientItem);
        HttpUtils.post("application/app/generateClientSecret" , $scope.item , function (response) {
            $scope.item.secretKey = response.data;
        })
    }

    $scope.onKeycloakClientCredentialChange = function(){
        HttpUtils.post("application/app/onKeycloakClientCredentialChange" , $scope.item , function (response) {

        })
    }

    $scope.onAuthTypeChange = function (authType) {
        switch (authType) {
            case "client-secret":
            case "client-secret-jwt":
                $scope.getClientSecret();
                break;
            case "client-x509":
            case "client-jwt":
                $scope.onKeycloakClientCredentialChange();
                break;
        }
    }


    $scope.saveClientCredential = function () {
        HttpUtils.post("application/app/createKeycloakClientCredential" , $scope.item , function (response) {
            if ($scope.item.authType === 'client-jwt') {
                $scope.isSave = true ;
            }else {
                $scope.toggleForm();
                $scope.list();
            }

        })
    }

    $scope.generateNewKeysAndCertificate = function(){
        $scope.openGenerateAndDownloadCredential = true ;
    }


    $scope.generateAndDownload = function () {
        $scope.loadingLayer = HttpUtils.download('application/app/generateAndDownloadJwtCertificate', $scope.item, 'keystore.jks', 'application/octet-stream');
    }


    $scope.sync = function () {
        $scope.loadingLayer =  HttpUtils.post("application/app/sync" , {} , function () {
            $scope.list();
            Notification.success("同步成功！");
        } , function (resp) {
            Notification.danger(resp.message);
        })
    }

});

