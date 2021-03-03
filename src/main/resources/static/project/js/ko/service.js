ProjectApp.controller('ServiceController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ,UserService ,eyeService,ProhibitPrompts) {

// 定义搜索条件
    $scope.conditions = [
        {key: "instanceName", name: "实例名称", directive: "filter-contains"},
        {key: "ipArray" , name: "IP地址" ,directive: "filter-contains" }
    ]

    $scope.currentRole = UserService.getUserInfo().parentRoleId;


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

    if ($scope.currentRole === $scope.roleConst.admin || $scope.currentRole === $scope.roleConst.orgAdmin ) {
        $scope.conditions.push({
            key: "workspaceId",
            name: "工作空间",
            directive: "filter-select-virtual",
            url: "workspace/listWorkspace",
            search: true,
            convert: {value: "id", label: "name"}
        })
    }


    // 用于传入后台的参数
    $scope.filters = [];

    $scope.columns = [
        {value: "序列", key: "index" , sort : false},// 不想排序的列，用sort: false
        {value: "实例名称", key: "cs.instance_name"},
        {value: "IP地址" , key: "cs.ip_array"},
        {value: "操作系统" , key: "cs.os"},
        {value: "操作系统版本" , key: "cs.osVersion"},
        {value: "组织" , key: "o.name"},
        {value: "工作空间" , key: "w.name"},
        {value: "备份服务注册步骤" , key: "tsb.step"},
        {value: "备份服务注册状态" , key: "tsb.active_status"}
    ];

    var INCREMENTAL = 'INCREMENTAL';
    var COMMAND = 'COMMAND';

    $scope.actions = [
        {key: INCREMENTAL, value: '文件备份'},
        {key: INCREMENTAL, value: 'MYSQL文件备份'},
        {key: COMMAND, value: 'MYSQL脚本备份'},
        {key: INCREMENTAL, value: 'DB2文件备份'},
        {key: COMMAND, value: 'DB2脚本备份'},
        {key: INCREMENTAL, value: 'MONGODB文件备份'},
        {key: COMMAND, value: 'MONGODB脚本备份'},
        {key: INCREMENTAL, value: 'ORACLE文件备份'},
        {key: COMMAND, value: 'ORACLE脚本备份'}
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
        HttpUtils.paging($scope, "tsm/service/listTsmServerBackupDTO", condition, function () {
            console.log($scope.items);
        });
    };

    $scope.list();


    $scope.listCloudServerInWorkSpace = function(){
        $scope.cloudServerList = [];
        var url = $scope.item.type === 'create' ? 'tsm/service/listCloudServerInWorkSpace4Create' : 'tsm/service/listCloudServerInWorkSpace4Update' ;
        $scope.loadingLayer = HttpUtils.get(url,function (resp) {
            $scope.cloudServerList = [];
            $scope.cloudServers  = resp.data;
            if ($scope.cloudServers) {
                angular.forEach($scope.cloudServers , function (cloudServer) {
                    $scope.cloudServer = {};
                    $scope.cloudServer.key = cloudServer.instanceUuid;
                    $scope.cloudServer.value = cloudServer.instanceName + "(" + cloudServer.ipArray.substring(cloudServer.ipArray.indexOf('[')+1 , cloudServer.ipArray.indexOf(']')).replace(/"/g,"")+")";
                    $scope.cloudServerList.push($scope.cloudServer);
                })
            }
            console.log($scope.cloudServerList);
        })
    };

    $scope.getIp = function (item) {
        let ipList = [];
        if (item.ipArray) {
            let ips = angular.fromJson(item.ipArray);
            ips.forEach(function (value) {
                var fdStart = value.indexOf("22");
                if (fdStart === 0 ) {
                    ipList.push({value: value, label: '(备)'})
                } else {
                    ipList.push({value: value})
                }
            });
        }
        return ipList;
    };


    $scope.openCreate = function () {
        $scope.item = {};
        $scope.item.type='create';
        $scope.formUrl = 'project/html/tsm/service/service-add.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    };


    $scope.checkVm4TSM = function (item) {
        $scope.checkRequest = {};
        $scope.checkRequest.instanceUuid = item.cloudServer;
        $scope.checkRequest.password = item.password;
        console.log(item.cloudServer);
        $scope.loadingLayer = HttpUtils.post('tsm/service/checkVm4TSM', $scope.checkRequest  ,function(resp){
            for(var key in resp.data){
                $scope.item.checkResults = resp.data[key];
                $scope.item.id = key;
            }

        })
    }


    $scope.getUsableAccounts = function(){
        $scope.loadingLayer = HttpUtils.get('setting/account/getUsableAccounts',function (resp) {
            $scope.accounts = resp.data;
        })
    }

    $scope.getDocUrl = function () {
        $scope.loadingLayer = HttpUtils.get('tsm/service/getDocUrl',function (resp) {
            $scope.item.docUrl = resp.data;
        })
    }

    $scope.updateTsmServerBackupActiveStatus = function(id){
        $scope.loadingLayer = HttpUtils.post('tsm/service/updateTsmServerBackupActiveStatus/'+id ,{} , function (resp) {
            $scope.item.activeResult = resp.data;
        },function (resp) {
            Notification.danger(resp.message)
        })
    }

    $scope.wizard = {
        setting: {
            title: "标题",
            subtitle: "子标题",
            closeText: "取消",
            submitText: "结束",
            nextText: "下一步",
            prevText: "上一步"
        },
        // 按顺序显示,id必须唯一并需要与页面中的id一致，select为分步初始化方法，next为下一步方法(最后一步时作为提交方法)
        steps: [
            {
                id: "1",
                name: "预检",
                select: function () {
                    if ($scope.item.type === 'create') {
                        $scope.listCloudServerInWorkSpace();
                    }
                },
                next: function () {
                    if(!$scope.item.checkResults){
                        Notification.info("尚未进行虚机预检，请先完成虚机预检");
                        return false;
                    }
                    $scope.allSuccess=true;
                    angular.forEach($scope.item.checkResults ,function (checkResult) {
                        if (!checkResult.success) {
                            $scope.allSuccess = false;
                        }
                    })

                    if (!$scope.allSuccess) {
                        Notification.info("虚机预检未完全通过");
                        return false;
                    }

                    if ($scope.item.step === 'CHECK' || !$scope.item.step) {
                        $scope.updateStep('REGISTER');
                    }

                    return true;
                }
            },
            {
                id: "2",
                name: "注册客户机",
                select: function () {
                    $scope.getUsableAccounts();
                },
                next: function () {

                    if (!$scope.item.registerInfo) {
                        Notification.info("尚未注册客户机，请先完成客户机注册。");
                        return false;
                    }

                    if ($scope.item.step === 'REGISTER') {
                        $scope.updateStep('ACTIVE');
                    }

                    return true;
                }
            },
            {
                id: "3",
                name: "安装备份软件",
                select: function () {
                    $scope.getDocUrl();
                },
                next: function () {
                    if ($scope.item.step === 'ACTIVE') {
                        $scope.updateStep('FINISH');
                    }
                    $scope.closeToggleForm();
                }
            }
        ],
        // 嵌入页面需要指定关闭方法
        close: function () {
            $scope.closeToggleForm();
            $scope.show = false;
        }
    };


    $scope.closeToggleForm = function () {
        $scope.item = {};
        $scope.list();
        $scope.toggleForm();
    };


    $scope.openUpdate = function(id){
        HttpUtils.get('tsm/service/getTsmServerBackupDTOById/'+id , function (resp) {
            $scope.item = {};
            $scope.item.id = resp.data.id;
            $scope.item.cloudServer = resp.data.instanceUuid;
            $scope.item.checkResults = resp.data.tsmVmCheckDTOList;
            $scope.item.registerInfo = resp.data.tsmNodePwd;
            $scope.item.activeResult = resp.data.tsmActiveStatusCheckResult;
            $scope.item.type = 'update' ;
            $scope.item.step = resp.data.step;
            $scope.item.canEditInstance = false;
            $scope.item.cloudServerName = resp.data.instanceName + "(" + resp.data.ipArray.substring(resp.data.ipArray.indexOf('[')+1 , resp.data.ipArray.indexOf(']')).replace(/"/g,"")+")";
            $scope.formUrl = 'project/html/tsm/service/service-add.html' + '?_t=' + Math.random();
            $scope.toggleForm();
            $scope.show = true;
        })
    }


    $scope.updateStep = function(step){
        $scope.updateStepRequest = {} ;
        $scope.updateStepRequest.id = $scope.item.id;
        $scope.updateStepRequest.step = step;
        $scope.loadingLayer = HttpUtils.post('tsm/service/updateStep',$scope.updateStepRequest ,function () {
            $scope.item.step = step;
        },function (resp) {
            Notification.danger(resp.message);
        })

    }

    $scope.resigterNode = function (accountId ) {
        $scope.registerRequest = {} ;
        $scope.registerRequest.accountId = accountId;
        $scope.registerRequest.id = $scope.item.id;
        $scope.loadingLayer = HttpUtils.post('tsm/service/resigterNode/'+$scope.item.cloudServer , $scope.registerRequest ,function (resp) {
            Notification.success('注册成功！');
            $scope.item.registerInfo = resp.data;
        } ,function (resp) {
            Notification.danger(resp.message);
        })
    }


    $scope.openUpdatePwd = function (id) {
        $scope.loadingLayer = HttpUtils.get('tsm/service/getTsmNode/'+id ,function (resp) {
            $scope.item = {};
            $scope.item.tsmServerBackupId = id ;
            $scope.item.nodeName = resp.data.nodeName;
            $scope.formUrl = 'project/html/tsm/service/service-update-pwd.html' + '?_t=' + Math.random();
            $scope.toggleForm();
            $scope.show = true;
        })
    }

    $scope.updatePwd = function (item) {
        $scope.updatePwdRequest = angular.copy(item);
        $scope.loadingLayer = HttpUtils.post('tsm/service/updateNodePwd' ,$scope.updatePwdRequest , function () {
            Notification.success("节点密码修改成功！");
            $scope.closeToggleForm();
        } ,function (resp) {
            Notification.danger(resp.message);
        })

    }


    $scope.openCreateOnetimeBackup = function(item){
        $scope.item = angular.copy(item);
        $scope.scheduleAnt = {} ;
        $scope.formUrl = 'project/html/tsm/service/service-create-onetime-backup.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    }

    $scope.createOnetimeBackup = function(id , scheduleAnt){
        $scope.createRequest = angular.copy(scheduleAnt);
        $scope.createRequest.objects = $scope.formatScheduleObjects($scope.createRequest.objects)
        $scope.loadingLayer = HttpUtils.post('tsm/service/createOnetimeBackup/'+id , $scope.createRequest  , function () {
            Notification.success("立即备份创建成功");
            $scope.closeToggleForm();
        } ,function (resp) {
            Notification.danger(resp.message)
            $scope.closeToggleForm();
        })
    }


    $scope.openCreateScheduleBackup = function(item){
        $scope.item = angular.copy(item);
        $scope.scheduleAnt = {} ;
        $scope.formUrl = 'project/html/tsm/service/service-create-schedule-backup.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    }

    $scope.createScheduleBackup = function(id , scheduleAnt){
        $scope.createRequest = angular.copy(scheduleAnt);

        $scope.createRequest.backupTplId = $scope.createRequest.backupTpl.id
        $scope.createRequest.objects = $scope.formatScheduleObjects($scope.createRequest.objects)

        $scope.loadingLayer = HttpUtils.post('tsm/service/createScheduledBackup/'+id , $scope.createRequest  , function () {
            Notification.success("策略备份创建成功");
            $scope.closeToggleForm();
        } ,function (resp) {
            Notification.danger(resp.message)
            $scope.closeToggleForm();
        })
    }


    $scope.getAllActiveBackupStrategyTpls = function () {
        HttpUtils.get('setting/strategy/getAllActiveBackupStrategyTpls',function (resp) {
            $scope.backupTpls = resp.data;
            console.log(resp.data);
        })
    }
    $scope.getAllActiveBackupStrategyTpls();

    $scope.changeType = function (id) {
        ProhibitPrompts.changeType(id);
    };


    $scope.view = function (password, eye) {
        eyeService.view("#" + password, "#" + eye);
    };


    $scope.formatScheduleObjects = function (origin) {
        if (origin && origin.length > 0) {
            origin = origin.replace(/，/g, ',')
            origin = origin.replace(/, /g, ',')
            origin = origin.replace(/“ /g, '"')
            origin = origin.replace(/” /g, '"')
        }
        return origin
    }


    $scope.showDetail = function (item) {
        $scope.detail = angular.copy(item);
        $scope.formUrl = 'project/html/tsm/service/service-event-schedule-details.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    }


});

ProjectApp.controller('ServiceEventAndScheduleController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ) {


});

ProjectApp.controller('ServiceEventController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ) {


    // 定义搜索条件
    $scope.conditions = [
         {key: "scheduleName", name: "策略名称", directive: "filter-input"},
         {key: "description", name: "策略描述", directive: "filter-input"},
         {key: "objects", name: "备份对象", directive: "filter-input"},
         {
            key: "oneTime",
            name: "备份类型",
            directive: "filter-select",
            selects: [
                {value: "true", label: "立即备份"},
                {value: "false", label: "定时备份"}
            ]
         }
    ];

    // 用于传入后台的参数
    $scope.filters = [];

    $scope.columns = [
        {value: "序号" , key: "index" , sort:false},
        {value: "策略名称" , key:"scheduleName" , sort:false},
        {value: "策略描述" ,key: "description" , sort:false},
        {value: "备份对象" ,key: "objects" , sort:false},
        {value: "执行时间" ,key: "scheduledStart" , sort:false},
        {value: "完成时间" ,key: "completed" , sort:false},
        {value: "备份结果" ,key: "reason" , sort:false},
        {value: "完成状态" ,key: "status" , sort:false}
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
        $scope.loadingLayer = HttpUtils.paging($scope, "tsm/service/paginationClientEvents/"+$scope.detail.id, condition, function () {
            console.log($scope.items);
        });
    };

    $scope.list();

});

ProjectApp.controller('ServiceScheduleController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ) {

    // 定义搜索条件
    $scope.conditions = [
        {key: "scheduleName", name: "策略名称", directive: "filter-input"},
        {key: "description", name: "策略描述", directive: "filter-input"},
        {key: "objects", name: "备份对象", directive: "filter-input"},
        {
            key: "oneTime",
            name: "备份类型",
            directive: "filter-select",
            selects: [
                {value: "true", label: "立即备份"},
                {value: "false", label: "定时备份"}
            ]
        }
    ];
    // 用于传入后台的参数
    $scope.filters = [];

    $scope.columns = [
        {value: "序号" , key: "index" , sort:false},
        {value: "策略名称" , key:"scheduleName" , sort:false},
        {value: "策略描述" ,key: "description" , sort:false},
        {value: "备份对象" ,key: "objects" , sort:false},
        {value: "备份起始时间" ,key: "startDate" , sort:false},
        {value: "备份类型" ,key: "_isOneTime" , sort:false},
        {value: "备份频率" ,key: "period" , sort:false},
        {value: "每个礼拜中的" ,key: "_isOneTime" , sort:false},
        {value: "失效时间" ,key: "expiration" , sort:false}

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
        $scope.loadingLayer = HttpUtils.paging($scope, "tsm/service/paginationClientSchedule/"+$scope.detail.id, condition, function () {
            console.log($scope.items);
        });
    };

    $scope.list();


    $scope.recoverSchedule = function (item) {
        $scope.loadingLayer = HttpUtils.post('tsm/service/recoverSchedule/'+$scope.detail.id+'/'+item.domainName+'/'+item.scheduleName , {} ,function () {
            Notification.success("备份策略恢复成功")
            $scope.list();
        } ,function (resp) {
            Notification.danger(resp.message)
            $scope.list();
        })
    }

    $scope.suspendSchedule = function (item) {
        $scope.loadingLayer = HttpUtils.post('tsm/service/suspendSchedule/'+$scope.detail.id+'/'+item.domainName+'/'+item.scheduleName , {} ,function () {
            Notification.success("备份策略停用成功")
            $scope.list();
        } ,function (resp) {
            Notification.danger(resp.message)
            $scope.list();
        })
    }

});
