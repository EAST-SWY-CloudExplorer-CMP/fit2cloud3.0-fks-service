let CommonApp = angular.module('CommonApp', ['f2c.common', 'ui.codemirror']);

const PRODUCT_ICON_OPTIONS = [
    {key: 'CentOS', value: 'project/img/centos.png'},
    {key: "SUSE", value: "/web-public/fit2cloud/img/os-icon/suse.png"},
    {key: 'Mysql', value: 'project/img/mysql.png'},
    {key: "Oracle", value: '/web-public/fit2cloud/img/os-icon/oracle.png'},
    {key: "RedHat", value: "/web-public/fit2cloud/img/os-icon/redhat.png"},
    {key: "SqlServer", value: "/web-public/fit2cloud/img/os-icon/sqlserver.png"},
    {key: "Tomcat", value: "project/img/tomcat.png"},
    {key: "Ubuntu", value: "/web-public/fit2cloud/img/os-icon/ubuntu.png"},
    {key: "Weblogic", value: "/web-public/fit2cloud/img/os-icon/weblogic.png"},
    {key: "Websphere", value: "/web-public/fit2cloud/img/os-icon/websphere.png"},
    {key: "AIX", value: "/web-public/fit2cloud/img/os-icon/aix.jpg"},
    {key: "Windows", value: "/web-public/fit2cloud/img/os-icon/windows.png"},
    {key: "Docker", value: "project/img/docker.png"},
    {key: "ElasticSearch", value: "project/img/elastic.png"},
    {key: "Golang", value: "project/img/golang.png"},
    {key: "HaProxy", value: "project/img/haproxy.png"},
    {key: "Html", value: "project/img/html.png"},
    {key: "Java", value: "project/img/java.png"},
    {key: "Javascript", value: "project/img/javascript.png"},
    {key: "Jenkins", value: "project/img/jenkins.png"},
    {key: "Kubernetes", value: "project/img/kubernetes.png"},
    {key: "MongoDB", value: "project/img/mongodb.png"},
    {key: "MQ", value: "project/img/mq.png"},
    {key: "Nginx", value: "project/img/nginx.png"},
    {key: "NodeJS", value: "project/img/nodejs.png"},
    {key: "Php", value: "project/img/php.png"},
    {key: "Prometheus", value: "project/img/prometheus.png"},
    {key: "Redis", value: "project/img/redis.png"},
    {key: "Tensorflow", value: "project/img/tensorflow.png"},
    {key: "Python", value: "project/img/python.png"},
];
const LAUNCH_CONFIGURATION_ROLE = {
    ADMIN: "admin",
    USER: "user"
};

CommonApp.constant("ELEMENT_TYPE", {
    INPUT: "text",
    SELECT: "multiSelect",
    CHECKBOX: "combobox",
    SWITCH: "boolean",
    TEXTAREA: "textarea",
    NUMBER: "number",
});

CommonApp.constant("ELEMENT_VALUE", {
    NULL: "未设置",
    TRUE: "是",
    FALSE: "否",
    UNKNOWN: "无效值",
});

CommonApp.filter('showExpiredTime', function (dateFilter) {
    return function (item, format) {
        if (!item) {
            return "";
        }
        // 永不到期不显示
        // if (item.expiredTimeType === 'NEVER' || item.expiredTimeType === 'never') {
        //     return "永不到期"
        // }
        return dateFilter(item.expiredTime, format);
    };
});

CommonApp.directive("orderReadOnly", function ($mdSidenav) {
    return {
        replace: true,
        template: '<div ng-include="url"></div>',
        link: function ($scope, element, attr, ctrl) {
            $scope.url = "project/html/order/order-read-only.html" + '?_t=' + window.appversion;

            $scope.show = function (orderItem) {
                orderItem.show = !orderItem.show;
            };

            $scope.advanceOption = function (orderItem) {
                $scope.model.orderItem = orderItem;
                $scope.model.currentOrder = $scope.currentOrder;
                //如果是订单查看页面或订单审批页面的已办订单则按只读处理
                if ($scope.model.showType === 'view' || ($scope.model.task && $scope.model.task.taskStatus !== 'PENDING')) {
                    $scope.model[orderItem.id] = "project/html/order/vm-create-advance-option-readonly.html" + '?_t=' + Math.random();
                } else {
                    $scope.model[orderItem.id] = "project/html/order/vm-create-advance-option.html" + '?_t=' + Math.random();
                }
                $mdSidenav(orderItem.id).open()
            }
            <!-- EAST #Dcp121706 -->
            ;
            $scope.editOrder = function (orderItem) {
                if ($scope.model.showType === 'view' || ($scope.model.task && $scope.model.task.taskStatus !== 'PENDING')) {
                    return;
                }
                orderItem.showOrder = true;
            };
            <!-- EAST -->
        }
    };
});

CommonApp.controller("VmCreateOrderAdvanceOptionController", function ($scope, HttpUtils, LaunchConfigurationService, Notification, $q, $timeout) {
    $scope.options = ['auto', 'manual'];
    $scope.orderItem = $scope.model.orderItem;
    $scope.currentOrder = $scope.model.currentOrder;
    $scope.task = $scope.model.task;
    $scope.taskId = $scope.model.taskId;
    $scope.showType = $scope.model.showType;
    $scope.allValid = true;
    $scope.readonly = true;
    $scope.current = {
        resourcePoolIds: [],    //保存手动选择的资源池id
        notFoundResourcePoolIds: [],   //保存手动选择了但是在数据库中不存在的资源池id
        notFoundResourcePools: []   //保存手动选择的资源池但是没有确认过的资源池列表(只有id和name属性)
    };
    $scope._loadingLayer = [];
    $scope._loadingLayer.add = function (item) {
        $scope._loadingLayer.push(item);
        $scope.productEditLoadingLayer = $scope._loadingLayer.concat([]);
    };

    $scope.instanceTypeOptionsName = "";

    $scope.init = function () {
        if ($scope.orderItem) {
            if ($scope.hasSelection()) {
                $scope.select = 'manual';
                let index = $scope.findSelectResourcePoolsItem();
                if (index > -1) {
                    $scope.selectResourcePools = $scope.orderItem.details[index].resourcePools.slice();
                }

                index = $scope.findSelectResourcePoolIdsItem();
                if (index > -1) {
                    $scope.orderItem.details[index].resourcePools.forEach(function (item) {
                        $scope.current.resourcePoolIds.push(item.id);
                        $scope.current.notFoundResourcePools.push(item);
                    })
                }
            } else {
                $scope.select = 'auto';
            }
            //存在taskId说明是订单审批页面
            //获取showType为retry则表示是重试订单
            //如果当前流程环节状态不是PENDING则为已办，则按只读处理
            if ((($scope.taskId && $scope.task && $scope.task.taskStatus === 'PENDING') || $scope.showType === 'retry')) {
                let promise1 = null;
                //重试订单时不需要判断产品中的高级选项配置
                if ($scope.showType !== 'retry') {
                    promise1 = $scope.getAdvanceOptions();
                } else {
                    //重试订单需要判断orderItem的状态，只有UNCHECKED或ERROR或TERMINATED的才可以编辑
                    if ($scope.orderItem.status === 'UNCHECKED' || $scope.orderItem.status === 'ERROR' || $scope.orderItem.status === 'TERMINATED') {
                        $scope.readonly = false;
                    } else {
                        $scope.readonly = true;
                    }
                }
                let promise2 = $scope.getResourcePools();
                $scope.productEditLoadingLayer = $q.all([promise1, promise2]);
            } else {
                if ($scope.selectResourcePools) {
                    for (let i = 0; i < $scope.selectResourcePools.length; i++) {
                        $scope.selectResourcePools[i]._show = false;
                        $scope.selectResourcePools[i].change = true;
                        $scope.selectResourcePools[i].launchConfiguration = angular.fromJson($scope.selectResourcePools[i].launchConfiguration);
                    }
                } else {
                    $scope.selectResourcePools = [];
                }

                $scope.getResourcePoolsReadonly();
            }
        }
    };

    //把init方法保存到model中，否则订单列表页面查看高级选项时不会刷新，订单审批的时候不会有这中情况，因为订单审批页面每次点击一个订单都会重新刷新一次
    $scope.model.callback = $scope.init;

    $scope.show = function (resourcePool) {
        resourcePool._show = !resourcePool._show;
    };

    $scope.selectOnChange = function (resourcePool, item) {
        if (item && resourcePool.edit) {
            if (item.name === "ip") {
                // 获取候选IP地址
                LaunchConfigurationService.getIpPoolOptionList({
                    launchConfiguration: resourcePool.launchConfiguration,
                    accountId: resourcePool.accountId,
                }, true);
                return;
            }
            LaunchConfigurationService.getLaunchConfigurationChildren($scope, {
                launchConfiguration: resourcePool.launchConfiguration,
                accountId: resourcePool.accountId,
            }, item);
        }
    };

    $scope.getAdvanceOptions = function () {
        if ($scope.orderItem.customData) {
            let customData = angular.fromJson($scope.orderItem.customData);
            let advanceOptions = customData.advanceOptions;
            if (advanceOptions && advanceOptions.length > 0) {
                return HttpUtils.get('flow/runtime/task/' + $scope.taskId, function (response) {
                    if (response.data) {
                        $scope.readonly = advanceOptions.indexOf(response.data.taskActivity) === -1;
                    } else {
                        $scope.readonly = true;
                    }
                });
            } else {
                $scope.readonly = true;
            }
        } else {
            $scope.readonly = true;
        }
    };

    $scope.getResourcePools = function () {
        if (!$scope.resourcePools) {
            //根据launchConfiguration获取资源池
            let request = {
                launchConfiguration: angular.toJson($scope.orderItem.details),
                productId: $scope.orderItem.productId,
                workspaceId: $scope.currentOrder.workspaceId,
            };
            return HttpUtils.post('resource-pool/launch/configuration/list', request, function (response) {
                let resourcePools = response.data;
                if (resourcePools && resourcePools.length > 0) {
                    let resourcePoolIds = [];
                    resourcePools.forEach(function (item) {
                        item.edit = false;
                        //把所有资源池的id放到resourcePools，自动选择资源池时需要选择所有的资源池
                        resourcePoolIds.push(item.id);
                        //每个资源池后台请求容量信息
                        item.capacity = "loading";
                        HttpUtils.get('resource-pool/capacity/' + item.id, function (response) {
                            if (response.data) {
                                let capacity = response.data;
                                let cpuDescription = "CPU总量: " + capacity.cpuTotal + capacity.cpuUnit + "，剩余: " + capacity.cpuUnUsedPercentage + "%；";
                                let memoryDescription = "内存总量: " + capacity.memTotal + capacity.memUnit + "，剩余: " + capacity.memUnUsed + capacity.memUnit + "；";
                                let storageDescription = "存储总量: " + capacity.storageTotal + capacity.storageUnit + "，剩余: " + capacity.storageUnUsed + capacity.storageUnit + "。";
                                item.capacity = cpuDescription + memoryDescription + storageDescription;
                            } else {
                                item.capacity = "N/A";
                            }
                            //模拟点击的目的是资源池选项下的loading图标不知道为什么要在页面点击一下才能消失
                            $timeout(function () {
                                $("#resourcePoolIds").click();
                            }, 100);
                        }, function () {
                            $timeout(function () {
                                $("#resourcePoolIds").click();
                            }, 100);
                            item.capacity = "N/A";
                        });

                        //保存了json的资源池覆盖数据库中的资源池
                        if ($scope.selectResourcePools) {
                            for (let i = 0; i < $scope.selectResourcePools.length; i++) {
                                if ($scope.selectResourcePools[i].id === item.id) {
                                    item.launchConfiguration = $scope.selectResourcePools[i].launchConfiguration;
                                    item.edit = false;
                                    //编辑过json的资源池应该始终保存json
                                    item._confirm = true;
                                    $scope.current.resourcePoolIds.push(item.id);
                                    break;
                                }
                            }
                        }

                        item.launchConfiguration = angular.fromJson(item.launchConfiguration);
                        item.sourceLaunchConfiguration = angular.copy(item.launchConfiguration);
                    });

                    $scope.resourcePoolIds = resourcePoolIds;
                    $scope.resourcePools = resourcePools;
                } else {
                    $scope.resourcePoolIds = [];
                    $scope.resourcePools = [];
                }

                //选择出数据库中不存在的id
                $scope.current.resourcePoolIds.forEach(function (item) {
                    if ($scope.resourcePoolIds.indexOf(item) === -1) {
                        for (let i = 0; i < $scope.current.notFoundResourcePools.length; i++) {
                            let resourcePool = $scope.current.notFoundResourcePools[i];
                            if (resourcePool.id === item) {
                                $scope.resourcePools.push({
                                    id: resourcePool.id,
                                    name: resourcePool.name,
                                    capacity: "资源池不存在",
                                    notFound: true,
                                });
                                break;
                            }
                        }
                    }
                });

                //如果保存过json的资源池在数据库中不存在则添加到资源池列表中
                if ($scope.selectResourcePools) {
                    $scope.selectResourcePools.forEach(function (item) {
                        if ($scope.resourcePoolIds.indexOf(item.id) === -1) {
                            item.edit = false;
                            //编辑过json的资源池应该始终保存json
                            item._confirm = true;

                            item.launchConfiguration = angular.fromJson(item.launchConfiguration);
                            item.sourceLaunchConfiguration = angular.copy(item.launchConfiguration);
                            $scope.resourcePoolIds.push(item.id);
                            $scope.resourcePools.push(item);
                            $scope.current.resourcePoolIds.push(item.id);
                        }
                    });
                }
            })
        }
    };

    $scope.getResourcePoolsReadonly = function () {
        if (!$scope.resourcePools) {
            //根据launchConfiguration获取资源池
            let request = {
                launchConfiguration: angular.toJson($scope.orderItem.details),
                productId: $scope.orderItem.productId,
                workspaceId: $scope.currentOrder.workspaceId,
            };
            return HttpUtils.post('resource-pool/launch/configuration/list', request, function (response) {
                let resourcePools = response.data;
                if (resourcePools && resourcePools.length > 0) {
                    resourcePools.forEach(function (item) {
                        //检查只是选择而没有修改json的资源池id中是否包含当前资源池id，如果有则显示其json
                        let index = $scope.current.resourcePoolIds.indexOf(item.id);
                        if (index > -1) {
                            $scope.current.resourcePoolIds.splice(index, 1);
                            item.edit = false;
                            item.launchConfiguration = angular.fromJson(item.launchConfiguration);
                            $scope.selectResourcePools.push(item);
                        }
                    });
                }

                //notFoundResourcePools包含了所有只选择而没有修改的资源池，notFoundResourcePools这个名字在查看订单里没有特殊含义
                //$scope.current.resourcePoolIds在上面的forEach后只剩下数据库中没找到的资源池id，这里把这些资源池添加到列表中
                $scope.current.notFoundResourcePools.forEach(function (item) {
                    if ($scope.current.resourcePoolIds.indexOf(item.id) > -1) {
                        $scope.selectResourcePools.push({
                            id: item.id,
                            name: item.name,
                            notFound: true
                        });
                    }
                })
            }, function () {
                //notFoundResourcePools包含了所有只选择而没有修改的资源池，notFoundResourcePools这个名字在查看订单里没有特殊含义
                //$scope.current.resourcePoolIds在上面的forEach后只剩下数据库中没找到的资源池id，这里把这些资源池添加到列表中
                $scope.current.notFoundResourcePools.forEach(function (item) {
                    if ($scope.current.resourcePoolIds.indexOf(item.id) > -1) {
                        $scope.selectResourcePools.push({
                            id: item.id,
                            name: item.name,
                            notFound: true
                        });
                    }
                })
            })
        }
    };

    $scope.edit = function (resourcePool) {
        resourcePool.edit = true;
        resourcePool._show = true;
        resourcePool.confirm = true;
        LaunchConfigurationService.getLaunchConfiguration($scope, resourcePool);
    };

    $scope.confirm = function (resourcePool) {
        resourcePool.edit = false;
        //标记资源池需要被添加到指定资源池列表中
        resourcePool.sourceLaunchConfiguration = angular.copy(resourcePool.launchConfiguration);
    };

    $scope.cancel = function (resourcePool) {
        resourcePool.confirm = false;
        resourcePool.launchConfiguration = angular.copy(resourcePool.sourceLaunchConfiguration);
        resourcePool.edit = false;
    };

    $scope.idFilter = function (resourcePoolIds) {
        return function (item) {
            return resourcePoolIds && resourcePoolIds.indexOf(item.id) !== -1;
        }
    };

    $scope.isShow = function (item) {
        if ($scope.instanceTypeOptionsName === "") {
            let tempProduct = {launchConfiguration: $scope.orderItem.details};
            // 可选实例类型
            let instanceTypeSetting = LaunchConfigurationService.getLaunchConfigurationItemByField(tempProduct, "instanceTypeSetting", true);
            if (instanceTypeSetting && instanceTypeSetting.source === item.name) {
                return false;
            }
        } else if ($scope.instanceTypeOptionsName === item.name) {
            return false;
        }

        return item.role === 'admin' && item.deleted !== true;
    };

    $scope.valid = function () {
        //验证选择的资源池数量，至少一个
        if ($scope.current.resourcePoolIds.length === 0) {
            Notification.danger("请选择资源池");
            return false;
        }

        //验证选择的资源池不全是未找到的
        let found = false;
        for (let i = 0; i < $scope.resourcePools.length; i++) {
            let resourcePool = $scope.resourcePools[i];
            if ($scope.current.resourcePoolIds.indexOf(resourcePool.id) !== -1) {
                if (!resourcePool.notFound) {
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            Notification.danger("选择的资源池不存在");
            return false;
        }

        //验证每个被选择的资源池的必选参数是否有值
        for (let i = 0; i < $scope.resourcePools.length; i++) {
            let resourcePool = $scope.resourcePools[i];
            if (resourcePool.notFound) {
                continue;
            }
            if ($scope.current.resourcePoolIds.indexOf(resourcePool.id) !== -1) {
                if (!$scope.validRequire(resourcePool)) {
                    return false;
                }
            }
        }

        //后台请求验证每个被选择的资源池参数
        let promises = [];
        for (let i = 0; i < $scope.resourcePools.length; i++) {
            let resourcePool = $scope.resourcePools[i];
            if (resourcePool.notFound) {
                continue;
            }
            if ($scope.current.resourcePoolIds.indexOf(resourcePool.id) !== -1) {
                promises.push($scope.validateLaunchConfiguration($scope.resourcePools[i]));
            }
        }

        //如果所有资源池都是有效的则执行_submit()方法
        $q.all(promises).then(function () {
            let allValid = true;
            for (let i = 0; i < $scope.resourcePools.length; i++) {
                if (!$scope.resourcePools[i]) {
                    allValid = false;
                    break;
                }
            }

            for (let i = 0; i < $scope.resourcePools.length; i++) {
                let resourcePool = $scope.resourcePools[i];
                if ($scope.current.resourcePoolIds.indexOf(resourcePool.id) !== -1) {
                    $scope.confirm(resourcePool);
                }
            }

            if (allValid) {
                $scope._submit();
            }
        });
    };

    $scope.validRequire = function (resourcePool) {
        for (let j = 0; j < resourcePool.launchConfiguration.length; j++) {
            let item = resourcePool.launchConfiguration[j];
            let val = true;
            if (item.role === 'admin' && item.required) {
                if (item.inputType === 'multiSelect') {
                    //多选
                    if (item.value == null || item.value.length === 0) {
                        val = false;
                    }
                }
                if (item.inputType === 'combobox') {
                    //单选，可能有的选项的value是空串
                    if (item.value === '') {
                        val = true;
                    } else if (!item.value) {
                        val = false;
                    }
                }

                if (item.inputType !== 'combobox' && item.inputType !== 'boolean' && item.inputType !== 'multiSelect') {
                    //text, password
                    if (item.value == null || item.value === '') {
                        val = false;
                    }
                }
            }
            if (!val) {
                Notification.danger("资源池" + resourcePool.name + " " + item.label + '不能为空');
                return false;
            }
            if (item.name === "ip" && item.value === 'static') {
                Notification.danger("资源池" + resourcePool.name + item.label + "不支持手动指定");
                return false;
            }
        }
        return true;
    };

    $scope.validateLaunchConfiguration = function (resourcePool) {
        resourcePool.valid = true;
        let tmpProduct = angular.copy(resourcePool);
        tmpProduct.launchConfiguration.push({"name": "isResourcePool", "value": true});
        resourcePool.productEditLoadingLayer = HttpUtils.post('product/launch/configuration/validate/admin/' + resourcePool.accountId, tmpProduct, function () {
        }, function (error) {
            resourcePool.valid = false;
            Notification.danger("资源池" + resourcePool.name + "校验失败, " + error.message)
        });
        $scope._loadingLayer.add(resourcePool.productEditLoadingLayer);
        return resourcePool.productEditLoadingLayer;
    };

    $scope.close = function () {
        $scope.toggleForm();
        //如果是从重试订单页面打开的则需要通过该方法关闭侧边栏
        if ($scope.closeForm2) {
            $scope.closeForm2();
        }
    };

    $scope.submit = function () {
        if ($scope.select === 'manual') {
            $scope.valid();
        } else {
            $scope._submit();
        }
    };

    $scope._submit = function () {
        if ($scope.select === 'manual') {
            let index = $scope.findSelectResourcePoolsItem();
            let select = index > -1;

            if (select) {
                //删除之前的selectResourcePools配置
                $scope.orderItem.details.splice(index, 1);
            }

            let resourcePools = {
                name: "selectResourcePools",
                inputType: "text", //没有该属性elementRuntimeReadOnly指令无法找到对应页面
                hidden: true //防止该属性显示在订单查看页面
            };
            //表示该order_item在提交审批时需要更新数据库
            $scope.orderItem.edit = true;
            resourcePools.resourcePools = [];

            for (let i = 0; i < $scope.resourcePools.length; i++) {
                let resourcePool = $scope.resourcePools[i];
                //确认过的资源池保存整个json
                if ($scope.current.resourcePoolIds.indexOf(resourcePool.id) !== -1 && (resourcePool.confirm || resourcePool._confirm) && !resourcePool.notFound) {
                    resourcePools.resourcePools.push($scope.getResourcePoolObj(resourcePool));
                }
            }
            if (resourcePools.resourcePools.length > 0) {
                $scope.orderItem.details.push(resourcePools);
            }

            index = $scope.findSelectResourcePoolIdsItem();
            select = index > -1;

            if (select) {
                //删除之前的selectResourcePoolIds配置
                $scope.orderItem.details.splice(index, 1);
            }
            let resourcePoolIds = {
                name: "selectResourcePoolIds",
                inputType: "text", //没有该属性elementRuntimeReadOnly指令无法找到对应页面
                hidden: true //防止该属性显示在订单查看页面
            };
            //表示该order_item在提交审批时需要更新数据库
            $scope.orderItem.edit = true;
            resourcePoolIds.resourcePools = [];

            for (let i = 0; i < $scope.resourcePools.length; i++) {
                let resourcePool = $scope.resourcePools[i];
                //没有确认过的保存id
                if ($scope.current.resourcePoolIds.indexOf(resourcePool.id) !== -1 && !resourcePool.confirm && !resourcePool._confirm) {
                    resourcePoolIds.resourcePools.push({
                        id: resourcePool.id,
                        name: resourcePool.name,
                    });
                }
            }

            if (resourcePoolIds.resourcePools.length > 0) {
                $scope.orderItem.details.push(resourcePoolIds);
            }
        } else if ($scope.select === 'auto') {
            $scope.orderItem.edit = false;
            let index = $scope.findSelectResourcePoolsItem();
            let select = index > -1;

            if (select) {
                $scope.orderItem.details.splice(index, 1);
                $scope.orderItem.edit = true;
            }

            index = $scope.findSelectResourcePoolIdsItem();
            select = index > -1;

            if (select) {
                $scope.orderItem.details.splice(index, 1);
                $scope.orderItem.edit = true;
            }
        }
        $scope.close();
    };

    $scope.findSelectResourcePoolsItem = function () {
        let index = -1;
        for (let i = 0; i < $scope.orderItem.details.length; i++) {
            let item = $scope.orderItem.details[i];
            if (item.name === 'selectResourcePools') {
                index = i;
                break;
            }
        }
        return index;
    };

    $scope.findSelectResourcePoolIdsItem = function () {
        let index = -1;
        for (let i = 0; i < $scope.orderItem.details.length; i++) {
            let item = $scope.orderItem.details[i];
            if (item.name === 'selectResourcePoolIds') {
                index = i;
                break;
            }
        }
        return index;
    };

    $scope.hasSelection = function () {
        return $scope.findSelectResourcePoolIdsItem() > -1 || $scope.findSelectResourcePoolsItem() > -1;
    };

    $scope.getResourcePoolObj = function (resourcePool) {
        let obj = angular.copy(resourcePool);
        obj.launchConfiguration = angular.toJson(resourcePool.launchConfiguration);
        delete obj.capacity;
        return obj;
    };

    $scope.init();
});

CommonApp.directive("orderTagInfo", function (HttpUtils, Notification) {
    return {
        replace: true,
        templateUrl: "project/html/order/order-tag-info-view.html" + '?_t=' + window.appversion,
        scope: {
            orderTags: "=",
        },
        link: function ($scope, element, attr, ctrl) {

            $scope.listTags = function () {
                $scope.loading = HttpUtils.get("tag/listAll", function (response) {
                    $scope.tags = response.data;
                }, function (response) {
                    Notification.danger(response);
                });
            };

            $scope.getTagKey = function (tagKey) {
                if ($scope.tags && $scope.tags.length > 0) {
                    for (let i = 0; i < $scope.tags.length; i++) {
                        let tag = $scope.tags[i];
                        if (tag.tagKey === tagKey) {
                            return tag.tagAlias;
                        }
                    }
                }
                return "标签KEY无效"
            };

            $scope.getTagValue = function (tagKey, tagValueId) {
                if ($scope.tags && $scope.tags.length > 0) {
                    for (let i = 0; i < $scope.tags.length; i++) {
                        let tag = $scope.tags[i];
                        if (tag.tagKey === tagKey && tag.tagValues && tag.tagValues.length > 0) {
                            for (let j = 0; j < tag.tagValues.length; j++) {
                                if (tag.tagValues[j].id === tagValueId) {
                                    return tag.tagValues[j].tagValueAlias;
                                }
                            }
                        }
                    }
                }
                return "标签值无效"
            };

            $scope.listTags();
        }
    };
});

CommonApp.directive("middlewareInfo", function () {
    return {
        replace: true,
        templateUrl: "project/html/order/middleware-info-view.html" + '?_t=' + window.appversion,
        scope: {
            middlewareList: "=",
        },
        link: function ($scope, element, attr, ctrl) {
        }
    };
});


CommonApp.directive("formRuntimeReadOnly", function (LaunchConfigurationService) {
    return {
        replace: true,
        templateUrl: "project/html/task/form-runtime-read-only.html" + '?_t=' + window.appversion,
        scope: {
            context: "=",
            isShow: "=?",
        },
        link: function ($scope) {
            let launchConfiguration = $scope.context.details;
            $scope.elements = angular.copy(launchConfiguration);
            let tmpProduct = {launchConfiguration: launchConfiguration};
            let instanceTypeSetting = LaunchConfigurationService.getLaunchConfigurationItemByField(tmpProduct, "instanceTypeSetting", true);
            if (instanceTypeSetting && instanceTypeSetting.source) {
                $scope.instanceTypeOptionsName = instanceTypeSetting.source;
            }

            if (!$scope.isShow) {
                $scope.isShow = function (element) {
                    if (element.inputType === 'password') {
                        return false;
                    }
                    if (element.name === 'instanceTypeOptions' || element.name === $scope.instanceTypeOptionsName) {
                        return false;
                    }
                    if (element.cpuSetting === true || element.memorySetting === true) {
                        return false;
                    }
                    if (element.hidden) {
                        return false;
                    }
                    return true;
                }
            }
            // EAST #Dcp121706
            $scope.$on('refreshOrderContentEvent', function (ev, data) {
                if ($scope.context.id === data.id) {
                    $scope.context.edit = true;
                    $scope.context.details = angular.copy(data.elements);
                    $scope.elements = data.elements;
                    $scope.addOrgInfo();
                }
            });
            // EAST
            // EAST Dzyh20190728
            $scope.addOrgInfo = function () {
                if ($scope.$parent.$parent.currentOrder) {
                    $scope.elements.splice(0, 0, {
                        "role": "user",
                        "name": "organizationName",
                        "description": "组织",
                        "inputType": "text",
                        "label": "组织",
                        "value": $scope.$parent.$parent.currentOrder.organizationName,
                        "required": true
                    });
                    $scope.elements.splice(1, 0, {
                        "role": "user",
                        "name": "workspaceName",
                        "description": "工作空间",
                        "inputType": "text",
                        "label": "工作空间",
                        "value": $scope.$parent.$parent.currentOrder.workspaceName,
                        "required": true
                    });
                }
            };
            $scope.addOrgInfo();
            // EAST
        }
    };
});

// EAST #Dcp121706
CommonApp.directive("formRuntimeEditable", function (LaunchConfigurationService) {
    return {
        replace: true,
        templateUrl: "project/html/task/form-runtime-editable.html" + '?_t=' + window.appversion,
        scope: {
            context: "=",
            isShow: "=?",
        },
        link: function ($scope) {
            let launchConfiguration = angular.copy($scope.context.details);
            $scope.elements = launchConfiguration;
            $scope.orderItemId = $scope.context.id;

            let tmpProduct = {launchConfiguration: launchConfiguration};
            let instanceTypeSetting = LaunchConfigurationService.getLaunchConfigurationItemByField(tmpProduct, "instanceTypeSetting", true);
            if (instanceTypeSetting && instanceTypeSetting.source) {
                $scope.instanceTypeOptionsName = instanceTypeSetting.source;
            }

            if (!$scope.isShow) {
                $scope.isShow = function (element) {
                    if (element.inputType === 'password') {
                        return false;
                    }
                    // 处理主机命名策略
                    if (element.name === "hostnamePolicy") {
                        handleHostnamePolicy($scope, element, LaunchConfigurationService);
                    }
                    if (element.name === "changePasswordPolicy") {
                        handlePasswordPolicy($scope, element, LaunchConfigurationService);
                    }
                    if (element.name === "addDomain") {
                        handleAddDomain($scope, element, LaunchConfigurationService);
                    }
                    if (element.name === 'instanceTypeOptions' || element.name === $scope.instanceTypeOptionsName) {
                        return false;
                    }
                    if (element.cpuSetting === true || element.memorySetting === true) {
                        return false;
                    }
                    if (element.hidden) {
                        return false;
                    }
                    return true;
                }
            }
            $scope.reject = function () {
                delete $scope.context.showOrder;
                $scope.elements = angular.copy($scope.context.details);
            };
            $scope.complete = function () {
                delete $scope.context.showOrder;
                $scope.$root.$broadcast('refreshOrderContentEvent', {
                    elements: angular.copy($scope.elements),
                    id: $scope.orderItemId
                });
            };
        }
    };
});

CommonApp.directive("elementRuntimeEditable", function (LaunchConfigurationService, HttpUtils) {
    return {
        replace: true,
        template: '<div class="element-runtime" ng-include="url"></div>',
        scope: {
            platform: "=",
            elements: "=",
            element: "=",
            order: "=",
        },
        link: function ($scope, element, attr, ctrl) {
            if ($scope.element.inputType) {
                $scope.url = "project/html/task/element/" + $scope.element.inputType + "-runtime.html" + '?_t=' + window.appversion;
            }

            $scope.selectOnChange = function (element) {
                // 处理主机命名策略
                if (element.name === "hostnamePolicy") {
                    handleHostnamePolicy($scope, element, LaunchConfigurationService);
                }
                if (element.name === "changePasswordPolicy") {
                    handlePasswordPolicy($scope, element, LaunchConfigurationService);
                }
                if (element.name === "addDomain") {
                    handleAddDomain($scope, element, LaunchConfigurationService);
                }
                if (element.name === "instanceType") {
                    handInstanceType($scope, element, LaunchConfigurationService);
                }
                handleResourcePoolTag($scope, element, HttpUtils);
            };
        }
    };
});

function handleHostnamePolicy($scope, element, LaunchConfigurationService) {
    let product = {
        launchConfiguration: $scope.elements
    };
    let hostnameMacro = LaunchConfigurationService.getLaunchConfigurationItem(product, "hostnameMacro");
    let hostname = LaunchConfigurationService.getLaunchConfigurationItem(product, "hostname");
    let hostnameMacroIndex = 0;
    if (!hostnameMacro) {
        let index = LaunchConfigurationService.getLaunchConfigurationItemIndex(product, "hostname");
        if (index === -1) {
            return;
        }
        hostnameMacro = {
            name: "hostnameMacro",
            inputType: "text",
            label: "hostname宏值",
            role: "admin",
            expression: true,
            required: true,
            value: ""
        };
        hostnameMacroIndex = index + 1;
        product.launchConfiguration.splice(hostnameMacroIndex, 0, hostnameMacro);
    } else {
        if (element.value === "macro") {
            hostnameMacro.label = "hostname宏值";
            hostnameMacro.description = "支持宏,${userInputHostname}为用户输入hostname宏.";
        }
        hostnameMacroIndex = LaunchConfigurationService.getLaunchConfigurationItemIndex(product, "hostnameMacro");
    }
    if (element.value === "sameWithVmName") {
        product.launchConfiguration.splice(hostnameMacroIndex, 1);
        hostname.isShow = false;
        hostname.hidden = true;
    }
    if (element.value === "macro") {
        hostnameMacro.isShow = true;
        hostnameMacro.hidden = false;
        hostname.isShow = false;
        hostname.hidden = true;
    }
    if (element.value === "userInput") {
        product.launchConfiguration.splice(hostnameMacroIndex, 1);
        hostname.isShow = true;
        hostname.hidden = false;
    }
}

function handlePasswordPolicy($scope, element, LaunchConfigurationService) {
    let product = {
        launchConfiguration: $scope.elements
    };
    let loginPassword = LaunchConfigurationService.getLaunchConfigurationItem(product, "loginPassword");
    let guestUser = LaunchConfigurationService.getLaunchConfigurationItem(product, "guestUser");
    if (element.value === "dontChange") {
        loginPassword.isShow = false;
        guestUser.isShow = false;
    }
    if (element.value === "changeTemplateUserPwd") {
        loginPassword.isShow = true;
        guestUser.isShow = false;
    }
    if (element.value === "changGuestUserPwd") {
        loginPassword.isShow = true;
        guestUser.isShow = true;
    }
}

function handleAddDomain($scope, element, LaunchConfigurationService) {
    let product = {
        launchConfiguration: $scope.elements
    };
    let domainName = LaunchConfigurationService.getLaunchConfigurationItem(product, "domainName");
    let domainUserName = LaunchConfigurationService.getLaunchConfigurationItem(product, "domainUserName");
    let domainUserPasswd = LaunchConfigurationService.getLaunchConfigurationItem(product, "domainUserPasswd");
    if (!element.value) {
        domainName.isShow = false;
        domainUserName.isShow = false;
        domainUserPasswd.isShow = false;
    } else {
        domainName.isShow = true;
        domainUserName.isShow = true;
        domainUserPasswd.isShow = true;
    }
}

function handleResourcePoolTag($scope, element, HttpUtils) {
    if (element.resourcePoolTag !== true) return;
    let product = {
        launchConfiguration: $scope.elements
    };
    // 找到所有资源池标签对象
    let resourcePoolTags = [];
    let configuration = product.launchConfiguration;
    for (let i = 0; i < configuration.length; i++) {
        if (configuration[i].resourcePoolTag) {
            resourcePoolTags.push(configuration[i]);
        }
    }

    // 获取已选标签，从上到下按顺序取，只取到当前选择对象的位置
    let tags = [], index = resourcePoolTags.length - 1;
    resourcePoolTags.forEach(function (tagItem, i) {
        if (tagItem.name === element.name) {
            index = i;
        }
        if (i <= index && tagItem.value !== null) {
            tags.push(tagItem.value);
        }
    });

    if (resourcePoolTags.length === tags.length) {
        return;
    }

    // 用已选择的标签获取其他标签候选值
    HttpUtils.post("resource-pool-tag/match/" + $scope.platform + "/" + $scope.order, tags, function (response) {
        let index = -1;
        for (let i = 0; i < resourcePoolTags.length; i++) {
            let tagItem = resourcePoolTags[i];
            if (tagItem.name === element.name) {
                index = i;
            }
            // 清空当前位置以下的资源池标签候选值
            if (index !== -1 && i > index) {
                tagItem.optionList = [];
                tagItem.value = null;
            }

            // 更新下一位的资源池标签候选值
            if (index !== -1 && i === index + 1 && element.value !== null) {
                let change = resourcePoolTags[index + 1];
                response.data.forEach(function (t) {
                    let tagKey = change.name.replace("resource_pool_tag_", "");
                    if (t.parent === tagKey) {
                        change.optionList.push({key: t.id, value: t.tagValue});
                    }
                });
            }
        }
    });
}

function handInstanceType($scope, element, LaunchConfigurationService) {
    let product = {
        launchConfiguration: $scope.elements
    };
    if (element.optionList) {
        let instance = {};
        for (let index in element.optionList) {
            if (element.value === element.optionList[index].value) {
                instance = element.optionList[index];
                break;
            }
        }
        let cpuCount = LaunchConfigurationService.getLaunchConfigurationItem(product, "cpuCount");
        cpuCount.value = instance.cpu;
        let memory = LaunchConfigurationService.getLaunchConfigurationItem(product, "memory");
        memory.value = instance.memory * 1024;
    }
}

// EAST

CommonApp.directive("elementRuntimeReadOnly", function (ElementService) {
    return {
        replace: true,
        template: '<div class="element-runtime-read-only" ng-include="url"></div>',
        scope: {
            context: "=",
            element: "=",
        },
        link: function ($scope, element, attr, ctrl) {
            //这里检查element的inputType是否为空，主要是处理在订单页面点击某个非创建虚拟机订单后在点创建虚拟机订单，浏览器控制台会报错，
            //这个错对用户是不可见的，也不影响使用。报错的原因是点击某个非创建虚拟机订单后order.js中的currentOrder为该订单，当之后点击创建
            //虚拟机订单后在请求订单详情返回前，order.js中的currentOrder还是之前的非创建虚拟机订单，此时虚拟机创建订单的浏览侧边栏已经打开了
            //传入到这个指令的context将是之前非创建虚拟机订单的某个属性，该属性肯定不会有inputType，导致404(在请求订单详情返回后订单仍然能正常显示)
            if ($scope.element.inputType) {
                $scope.url = "project/html/task/element-read-only/" + $scope.element.inputType + "-runtime.html" + '?_t=' + window.appversion;
                ElementService.initElement($scope.element);
            }
        }
    };
});

CommonApp.directive("formRuntime", function (ElementService) {
    return {
        replace: true,
        templateUrl: "project/html/task/form-runtime.html" + '?_t=' + window.appversion,
        scope: {
            context: "=",
            isShow: "=?",
        },
        link: function ($scope) {
            ElementService.filterElement($scope.context);
            if (!$scope.isShow) {
                $scope.isShow = function (element) {
                    if (element.inputType === 'password') {
                        return false;
                    }
                    if (element.name === 'instanceTypeOptions' || element.name === $scope.instanceTypeOptionsName) {
                        return false;
                    }
                    return true;
                }
            }
        }
    };
});

CommonApp.directive("elementRuntime", function () {
    return {
        replace: true,
        template: '<div class="element-runtime" ng-include="url"></div>',
        scope: {
            context: "=",
            element: "=",
        },
        link: function ($scope, element, attr, ctrl) {
            $scope.url = "project/html/task/element/" + $scope.element.inputType + "-runtime.html" + '?_t=' + window.appversion;
        }
    };
});

CommonApp.directive("cloudServerTextReadOnly", function () {
    return {
        replace: true,
        templateUrl: "project/html/order/cloud-server-info.html" + '?_t=' + window.appversion,
        scope: {
            server: "=",
        },
        link: function ($scope, element, attr, ctrl) {
        }
    };
});

CommonApp.directive("cloudServerTagReadOnly", function (HttpUtils) {
    return {
        replace: true,
        templateUrl: "project/html/order/cloud-server-tag-info.html" + '?_t=' + window.appversion,
        scope: {
            serverId: "=",
            orderItem: "="
        },
        link: function ($scope, element, attr, ctrl) {
            $scope.getTagInfo = function (serverId, orderItem) {
                if (!serverId) {
                    return;
                }
                let data = {
                    resourceId: serverId
                };
                HttpUtils.post("tag/mapping/list", data, function (response) {
                    orderItem.tags = response.data;
                });
            };

            $scope.getTagKey = function (tagKey) {
                if ($scope.tags && $scope.tags.length > 0) {
                    for (let i = 0; i < $scope.tags.length; i++) {
                        let tag = $scope.tags[i];
                        if (tag.tagKey === tagKey) {
                            return tag.tagAlias;
                        }
                    }
                }
                return "标签KEY无效"
            };

            $scope.getTagValue = function (tagKey, tagValueId) {
                if ($scope.tags && $scope.tags.length > 0) {
                    for (let i = 0; i < $scope.tags.length; i++) {
                        let tag = $scope.tags[i];
                        if (tag.tagKey === tagKey && tag.tagValues && tag.tagValues.length > 0) {
                            for (let j = 0; j < tag.tagValues.length; j++) {
                                if (tag.tagValues[j].id === tagValueId) {
                                    return tag.tagValues[j].tagValueAlias;
                                }
                            }
                        }
                    }
                }
                return "标签值无效"
            };

            $scope.listTags = function () {
                HttpUtils.get("tag/listAll", function (response) {
                    $scope.tags = response.data;
                    $scope.getTagInfo($scope.serverId, $scope.orderItem);
                }, function (response) {
                    Notification.danger(response);
                });
            };
            $scope.listTags();
        }
    };
});

CommonApp.service('EyeService', function () {
    this.view = function (password, eye) {
        let passwordElement = angular.element(password);
        let eyeElement = angular.element(eye);
        eyeElement.removeClass();
        if (passwordElement[0].type === 'password') {
            passwordElement[0].type = 'text';
            eyeElement.addClass("fa fa-eye-slash f2c-eye");
        } else {
            passwordElement[0].type = 'password';
            eyeElement.addClass("fa fa-eye f2c-eye");
        }
    };
});

CommonApp.directive("passwordEye", function (EyeService) {
    return {
        replace: true,
        templateUrl: "project/html/common/password-eye.html" + '?_t=' + window.appversion,
        scope: {
            index: "=",
            model: "=",
            require: "=?",
            disableLabel: "=?"
        },
        link: function ($scope) {
            $scope.view = function (index) {
                EyeService.view('#password' + index, '#eye' + index);
            };
        }
    }
});

CommonApp.service("ElementService", function (ELEMENT_TYPE, ELEMENT_VALUE) {
    this.initElement = function (element) {
        if (!element.optionList) {
            if (element.inputType !== ELEMENT_TYPE.SWITCH) {
                element.value = element.value ? element.value : ELEMENT_VALUE.NULL;
            } else {
                element.value = element.value ? ELEMENT_VALUE.TRUE : ELEMENT_VALUE.FALSE;
            }
            return;
        }
        switch (element.inputType) {
            case ELEMENT_TYPE.CHECKBOX:
                element.optionList.forEach(function (option) {
                    if (option[element.valueField] === element.value) {
                        element.value = option[element.textField];
                    }
                });
                break;
            case ELEMENT_TYPE.SELECT:
                let value = "";
                let contain = false;
                element.optionList.forEach(function (option) {
                    if ($.inArray(option[element.valueField], element.value) !== -1) {
                        value += option[element.textField] + ", ";
                        contain = true;
                    }
                });
                if (contain) {
                    element.value = value.substring(0, value.length - 2);
                } else {
                    element.value = ELEMENT_VALUE.UNKNOWN
                }
                break;
            case ELEMENT_TYPE.SWITCH:
                element.value = element.value ? ELEMENT_VALUE.TRUE : ELEMENT_VALUE.FALSE;
                break;
            case ELEMENT_TYPE.TEXTAREA:
                break;
        }
        if (element.inputType !== ELEMENT_TYPE.SWITCH) {
            element.value = element.value ? element.value : ELEMENT_VALUE.NULL;
        }
    };

    this.filterElement = function (context) {
        if (context && context.length > 0) {
            context.forEach(function (element) {
                if (element.name !== '') {

                }
            })
        }
    };
});

CommonApp.directive('multiTextReader', function ($document, $mdDialog) {
    return {
        replace: true,
        templateUrl: "project/html/common/multi-text-reader.html" + '?_t=' + window.appversion,
        scope: {
            value: "="
        },
        link: function ($scope) {
            $scope.show = false;

            if ($scope.value && $scope.value.indexOf('\n') !== -1) {
                //只显示第一行
                $scope.text = $scope.value.split('\n')[0] + "...";
                $scope.multiple = true;
            } else {
                $scope.text = $scope.value;
            }

            $scope.showContent = function () {
                $mdDialog.show({
                    templateUrl: "project/html/common/multi-text-reader-content.html" + '?_t=' + window.appversion,
                    parent: angular.element($document[0].body),
                    scope: $scope,
                    preserveScope: true,
                    clickOutsideToClose: true
                });
            };

            $scope.closeDialog = function () {
                $mdDialog.cancel();
            }
        }
    }
});

CommonApp.controller('multiTextReaderContentController', function ($scope, $timeout) {
    $timeout(function () {
        $scope.cmOption = {
            lineNumbers: true,
            indentWithTabs: true,
            theme: 'bespin'
        }
    }, 200);
});


CommonApp.service('LaunchConfigurationService', function (HttpUtils, Notification) {
    return {
        getOptionsByMethod: function ($scope, product, item) {
            if (item.keyNameSetting || item.source) return;
            let self = this;
            let tempProduct = angular.copy(product);
            tempProduct.launchConfiguration.forEach(function (e) {
                if (e.name === item.name) {
                    e.value = null;
                    return false;
                }
            });
            if (item.method) {
                let url;
                if (tempProduct.accountId) {
                    url = 'product/launch/configuration/account/' + tempProduct.accountId + '/' + item.method;
                } else {
                    url = 'product/launch/configuration/plugin/' + tempProduct.platform + '/' + item.method;
                }
                $scope._loadingLayer.add(HttpUtils.post(url, tempProduct, function (data) {
                    item.optionList = angular.fromJson(data.data);
                    if (item.value === undefined) {
                        if (item.inputType === 'multiSelect') {
                            item.value = [];
                        } else {
                            item.value = null;
                            if ((!item.required) === false) {
                                if (item.optionList.length > 0) {
                                    item.value = item.optionList[0][item.valueField];
                                }
                            }
                        }
                    } else {
                        if (item.inputType === 'combobox' && item.value) {
                            let valueInOptionList = false;
                            for (let i = 0; i < item.optionList.length; i++) {
                                if (item.value === item.optionList[i][item.valueField]) {
                                    valueInOptionList = true;
                                }
                            }
                            if (!valueInOptionList) {
                                delete item.value;
                            }
                        }
                        if (item.inputType === 'multiSelect' && item.value && item.value.length > 0) {
                            let tempValue = [];
                            for (let j = 0; j < item.value.length; j++) {
                                let valueInOptionList = false;
                                for (let i = 0; i < item.optionList.length; i++) {
                                    if (item.value[j] === item.optionList[i][item.valueField]) {
                                        valueInOptionList = true;
                                    }
                                }
                                if (valueInOptionList) {
                                    tempValue.push(item.value[j]);
                                }
                            }
                            item.value = tempValue;
                        }
                    }
                    self.getLaunchConfigurationChildren($scope, product, item);
                }));
            }
        },
        // 获取关联字段的下拉框内容
        getLaunchConfigurationChildren: function ($scope, product, parentItem) {
            let self = this;
            if (parentItem && parentItem.related !== undefined) {
                for (let i = 0; i < parentItem.related.length; i++) {
                    let targetItem = self.getLaunchConfigurationItem(product, parentItem.related[i]);
                    self.getLaunchConfigurationOption($scope, product, targetItem);
                }
            }
        },
        // 获取指定名字的对象
        getLaunchConfigurationItem: function (product, itemName) {
            if (!angular.isDefined(product) || !angular.isDefined(product.launchConfiguration)) return undefined;
            let configuration = product.launchConfiguration;
            for (let i = 0; i < configuration.length; i++) {
                if (configuration[i].name === itemName) {
                    return configuration[i];
                }
            }
            return undefined;
        },
        // 获取指定名字的字段的位置
        getLaunchConfigurationItemIndex: function (product, itemName) {
            let configuration = product.launchConfiguration;
            for (let i = 0; i < configuration.length; i++) {
                if (configuration[i].name === itemName) {
                    return i;
                }
            }
            return -1;
        },
        // 获取指定字段值的对象
        getLaunchConfigurationItemByField: function (product, field, value) {
            if (!angular.isDefined(product) || !angular.isDefined(product.launchConfiguration)) return undefined;
            let configuration = product.launchConfiguration;
            for (let i = 0; i < configuration.length; i++) {
                if (configuration[i][field] === value) {
                    return configuration[i];
                }
            }
            return undefined;
        },
        getKeyPairOptions: function ($scope, product, item) {
            let self = this;
            if (!product.approval && item.keyNameSetting) {
                $scope._loadingLayer.add(HttpUtils.get('keypair/list/all', function (response) {
                    item.optionList = [];
                    let pairs = response.data;

                    for (let i in pairs) {
                        let option = {};
                        option[item.textField] = pairs[i].name;
                        option[item.valueField] = pairs[i].name;
                        option.keyPairContent = pairs[i].publicKey;
                        option.keyPairId = pairs[i].id;
                        option.keyPairName = pairs[i].name;
                        item.optionList.push(option);
                    }

                    let emptyOption = {};
                    let noKey = "无密钥对创建";
                    emptyOption[item.textField] = noKey;
                    emptyOption[item.valueField] = noKey;
                    emptyOption.keyPairContent = "";
                    emptyOption.keyPairId = "";
                    emptyOption.keyPairName = "";
                    item.optionList.push(emptyOption);

                }));
            }
        },
        // 非插件方法获取可选实例类型下拉框内容
        getInstanceTypeOptions: function ($scope, product, item) {
            let self = this;
            if (item.name === 'instanceTypeOptions') {
                $scope._loadingLayer.add(HttpUtils.get('instance-type/list/all', function (data) {
                    item.optionList = [];
                    for (let i in data.data) {
                        let o = {};
                        o[item.valueField] = data.data[i].id;
                        o[item.textField] = data.data[i].name + " [" + data.data[i].cpu + "核" + data.data[i].memory + "G]";
                        o.cpu = data.data[i].cpu;
                        o.memory = data.data[i].memory;
                        item.optionList.push(o);
                    }
                    if (item.value === undefined) {
                        item.value = [];
                    }
                    //去除无效的value
                    let tmp = item.value;
                    item.value = [];
                    for (let i in tmp) {
                        let removal = true;
                        for (let j in item.optionList) {
                            if (tmp[i] === item.optionList[j][item.valueField]) {
                                removal = false;
                            }
                        }
                        if (!removal) {
                            item.value.push(tmp[i])
                        }
                    }
                    item.optionList = item.optionList.sort(function (v1, v2) {
                        return v1.cpu - v2.cpu && v1.memory - v2.memory;
                    });
                }));
            }
        },
        // 合并可选实例类型
        mergeInstanceTypeOptions: function (product) {
            let self = this;
            // 合并资源池的可选实例类型选项
            HttpUtils.post("resource-pool/launch/configuration/instance-type-options", product, function (response) {
                let instanceTypeSetting = self.getLaunchConfigurationItemByField(product, "instanceTypeSetting", true);
                let item = self.getLaunchConfigurationItem(product, instanceTypeSetting.source);
                if (item !== undefined) {
                    item.optionList = response.data;
                }
            });
        },
        getParentOptionsValueField: function ($scope, product, item) {
            if (!item.parentOptionsValueField || product.approval) {
                return;
            }
            for (let i = 0; i < product.launchConfiguration.length; i++) {
                if (product.launchConfiguration[i].related) {
                    for (let j = 0; j < product.launchConfiguration[i].related.length; j++) {
                        if (item.name === product.launchConfiguration[i].related[j]) {
                            if (product.launchConfiguration[i].optionList && product.launchConfiguration[i].value) {
                                let valueField = product.launchConfiguration[i].valueField;
                                for (let k = 0; k < product.launchConfiguration[i].optionList.length; k++) {
                                    if (product.launchConfiguration[i].value === product.launchConfiguration[i].optionList[k][valueField]) {
                                        if (product.launchConfiguration[i].optionList[k][item.parentOptionsValueField]) {
                                            item.value = product.launchConfiguration[i].optionList[k][item.parentOptionsValueField];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        // 获取下拉框内容
        getLaunchConfigurationOption: function ($scope, product, item) {
            let self = this;
            if (!item) {
                return;
            }
            if (!$scope._loadingLayer) {
                $scope._loadingLayer = [];
                $scope._loadingLayer.add = function (item) {
                    $scope._loadingLayer.push(item);
                    $scope.productEditLoadingLayer = $scope._loadingLayer.concat([]);
                };
            }
            if (item.method) {
                self.getOptionsByMethod($scope, product, item);
            } else {
                self.getInstanceTypeOptions($scope, product, item);
            }
            self.getKeyPairOptions($scope, product, item);
            self.getParentOptionsValueField($scope, product, item);
            self.initChildOptionList(item, product.launchConfiguration);
        },
        addDomain: function (launchConfiguration, sourceLaunchConfiguration) {
            let self = this;
            let index = self.getLaunchConfigurationItemIndex({launchConfiguration: launchConfiguration}, "addDomain");
            let addDomain = self.getLaunchConfigurationItem({launchConfiguration: launchConfiguration}, "addDomain");
            if (index === -1) return;

            let domainName, domainUserName, domainUserPasswd;
            if (angular.isDefined(sourceLaunchConfiguration)) {
                domainName = self.getLaunchConfigurationItem({launchConfiguration: sourceLaunchConfiguration}, "domainName");
                domainUserName = self.getLaunchConfigurationItem({launchConfiguration: sourceLaunchConfiguration}, "domainUserName");
                domainUserPasswd = self.getLaunchConfigurationItem({launchConfiguration: sourceLaunchConfiguration}, "domainUserPasswd");
            }
            if (!domainName) {
                domainName = {
                    name: "domainName",
                    inputType: "text",
                    label: '域',
                    group: "netInfoGroup",
                    role: "admin",
                    deleted: !addDomain.value
                };
            }
            if (!domainUserName) {
                domainUserName = {
                    name: "domainUserName",
                    inputType: "text",
                    label: '域用户',
                    group: "netInfoGroup",
                    role: "admin",
                    deleted: !addDomain.value
                };
            }
            if (!domainUserPasswd) {
                domainUserPasswd = {
                    name: "domainUserPasswd",
                    inputType: "password",
                    label: '域密码',
                    group: "netInfoGroup",
                    role: "admin",
                    deleted: !addDomain.value
                };
            }

            launchConfiguration.splice(index + 1, 0, domainName);
            launchConfiguration.splice(index + 3, 0, domainUserName);
            launchConfiguration.splice(index + 4, 0, domainUserPasswd);

        },
        addDeployPolicy: function ($scope, sourceProduct) {
            let self = this;
            // 增加放置策略
            let deployPolicy = self.getLaunchConfigurationItem(sourceProduct, "deploy_policy");
            if (!deployPolicy) {
                deployPolicy = {
                    label: "放置策略",
                    name: "deploy_policy",
                    group: "resourcePoolGroup",
                    inputType: "combobox",
                    optionList: $scope.deployPolicyOptions,
                    textField: "value",
                    valueField: "key",
                    role: LAUNCH_CONFIGURATION_ROLE.USER,
                    required: true,
                };
                sourceProduct.launchConfiguration.splice(0, 0, deployPolicy);
            }
            deployPolicy.value = $scope.currentProduct.extendData.deployPolicy;
        },
        getLaunchConfiguration: function ($scope, product) {
            let self = this;
            let url;
            if (product.accountId) {
                url = 'product/launch/configuration/account/' + product.accountId + "/vm"
            } else {
                url = 'product/launch/configuration/plugin/' + product.platform + "/vm";
            }
            if (typeof product.launchConfiguration === 'string') {
                product.launchConfiguration = angular.fromJson(product.launchConfiguration);
            }
            $scope._loadingLayer = [];
            $scope._loadingLayer.add = function (item) {
                $scope._loadingLayer.push(item);
                $scope.productEditLoadingLayer = $scope._loadingLayer.concat([]);
            };
            $scope._loadingLayer.add(HttpUtils.get(url, function (response) {
                let temItems = [];
                for (let i = 0; i < response.data.length; i++) {
                    if (response.data[i].hidden) {
                        //过滤不显示的
                        continue;
                    }
                    if (response.data[i].value === undefined && response.data[i].defaultValue !== undefined) {
                        response.data[i].value = response.data[i].defaultValue;
                    }
                    if (product.launchConfiguration === undefined) {
                        if (response.data[i].value !== undefined) {
                            let dv = response.data[i].value;
                            if (response.data[i].inputType === "number") {
                                response.data[i].value = Number(dv);
                            }
                            if (response.data[i].inputType === "boolean") {
                                response.data[i].value = Boolean(dv);
                            }
                        }
                    } else {
                        for (let j = 0; j < product.launchConfiguration.length; j++) {
                            if (response.data[i].name === product.launchConfiguration[j].name) {
                                response.data[i].deleted = product.launchConfiguration[j].deleted;
                                if (product.launchConfiguration[j].value !== undefined) {
                                    response.data[i].value = product.launchConfiguration[j].value;
                                }
                                if (angular.isDefined(response.data[i].method) && product.launchConfiguration[j].optionList) {
                                    response.data[i].optionList = product.launchConfiguration[j].optionList;
                                }
                            }
                        }
                    }
                    // accountId 存在代表资源池
                    if (product.accountId) {
                        if (response.data[i].resourcePoolProperty !== false) {
                            temItems.push(response.data[i]);
                        }
                    }
                    // accountId 不存在代表产品
                    else {
                        if (response.data[i].productProperty !== false) {
                            if (response.data[i].productProperty === true) {
                                temItems.push(response.data[i]);
                                continue;
                            }
                            // 没有联动的
                            if (!response.data[i].related && !response.data[i].parent) {
                                temItems.push(response.data[i]);
                            } else {
                                // 有联动并且类型不为combobox和multiSelect的
                                if (response.data[i].inputType !== "combobox" && response.data[i].inputType !== "multiSelect") {
                                    temItems.push(response.data[i]);
                                } else {
                                    let tempProduct = {launchConfiguration: response.data};
                                    // 可选实例类型
                                    let instanceTypeSetting = self.getLaunchConfigurationItemByField(tempProduct, "instanceTypeSetting", true);
                                    if (instanceTypeSetting && instanceTypeSetting.source === response.data[i].name) {
                                        temItems.push(response.data[i]);
                                    }
                                }
                            }
                        }
                    }
                }
                if (product.accountId) {
                    // IP池特殊处理
                    self.addIpPool(product.launchConfiguration, temItems);
                } else {
                    self.addDeployPolicy($scope, {launchConfiguration: temItems});
                }
                // 加域特殊处理
                self.addDomain(temItems, product.launchConfiguration);
                // EAST #Dzfg121705
                self.addHostnamePolicy(temItems, product.launchConfiguration);
                // EAST
                // EAST #Dzfg121705
                self.onChangeVmNamePolicy({launchConfiguration: temItems}, self.getLaunchConfigurationItem({launchConfiguration: temItems}, "vmNamePolicy"));
                // EAST
                product.launchConfiguration = temItems;
                self.getIpPoolOptionList(product, false);

                for (let i = 0; i < temItems.length; i++) {
                    let item = temItems[i];
                    if (!item.parent) {
                        self.getLaunchConfigurationOption($scope, product, item, false);
                    }
                }
                if (!product.accountId) {
                    self.mergeInstanceTypeOptions(product);
                }
            }));
        },
        addIpPool: function (oldLauchConfiguration, newLauchConfiguration) {
            let self = this;
            let sfIpItem = self.getLaunchConfigurationItem({launchConfiguration: newLauchConfiguration}, "ip");
            if (sfIpItem) {
                let sfIpPoolItem = self.getLaunchConfigurationItem({launchConfiguration: oldLauchConfiguration}, "ipPool");
                if (sfIpPoolItem) {
                    let index = self.getLaunchConfigurationItemIndex({
                        launchConfiguration: newLauchConfiguration
                    }, "ip");
                    newLauchConfiguration.splice(index + 1, 0, angular.copy(sfIpPoolItem));
                }
            }
        },
        getIpPoolOptionList: function (product, isClearValue) {
            let self = this;
            let SfIpItem = self.getLaunchConfigurationItem(product, "ip");
            let sfIpPoolItemName = "ipPool";
            if (!SfIpItem || SfIpItem.value !== 'auto_from_ippool') {
                product.launchConfiguration.forEach(function (item, i) {
                    if (item.name === sfIpPoolItemName) {
                        product.launchConfiguration.splice(i, 1);
                        return false;
                    }
                });
                return;
            }
            let sfIpPoolItem = self.getLaunchConfigurationItem(product, sfIpPoolItemName);
            if (!sfIpPoolItem) {
                sfIpPoolItem = {};
                sfIpPoolItem.name = sfIpPoolItemName;
                sfIpPoolItem.inputType = "multiSelect";
                sfIpPoolItem.label = "IP池";
                sfIpPoolItem.group = "netInfoGroup";
                sfIpPoolItem.role = "admin";
                sfIpPoolItem.required = true;
                sfIpPoolItem.valueField = "id";
                sfIpPoolItem.textField = "name";
                sfIpPoolItem.value = [];
                sfIpPoolItem.optionList = [];
                let index = self.getLaunchConfigurationItemIndex(product, "ip");
                product.launchConfiguration.splice(index + 1, 0, sfIpPoolItem);
            }
            if (isClearValue || !sfIpPoolItem.value) {
                sfIpPoolItem.value = [];
                sfIpPoolItem.optionList = [];
            }
            HttpUtils.get("ip/pool/account/" + product.accountId, function (response) {
                sfIpPoolItem.optionList = response.data;
                let tempValue = [];
                for (let j = 0; j < sfIpPoolItem.value.length; j++) {
                    let valueInOptionList = false;
                    for (let i = 0; i < sfIpPoolItem.optionList.length; i++) {
                        if (sfIpPoolItem.value[j] === sfIpPoolItem.optionList[i][sfIpPoolItem.valueField]) {
                            valueInOptionList = true;
                        }
                    }
                    if (valueInOptionList) {
                        tempValue.push(sfIpPoolItem.value[j]);
                    }
                }
                sfIpPoolItem.value = tempValue;
            });
        },
        valRequired: function (item, requiredRole) {
            let val = true;
            if (item.role === requiredRole && item.required) {
                if (item.inputType === 'multiSelect') {
                    //多选
                    if (item.value == null || item.value.length === 0) {
                        val = false;
                    }
                }
                if (item.inputType === 'combobox') {
                    if (item.value == null) {
                        val = false;
                    }
                }

                if (item.inputType !== 'combobox' && item.inputType !== 'boolean' && item.inputType !== 'multiSelect') {
                    //text, password
                    if (item.value == null || item.value === '') {
                        val = false;
                    }
                }
            }
            if (!val) {
                Notification.danger(item.label + '不能为空');
            }
            if (requiredRole === 'user' && item.required && item.inputType === 'password' && item.value) {
                let sValue = item.value;
                let modes = 0;
                //正则表达式验证符合要求的
                if (sValue.length >= 8) modes++; // 最短8个字符
                if (/\d/.test(sValue)) modes++; //数字
                if (/[a-z]/.test(sValue)) modes++; //小写
                if (/[A-Z]/.test(sValue)) modes++; //大写
                if (/\W/.test(sValue)) modes++; //特殊字符
                if (modes < 5) {
                    Notification.danger(item.label + '不能小于8位，且必须包含大写小写字母、数字和特殊字符');
                    val = false;
                }
            }

            // 验证自定义正则
            if (val && item.regex != null && item.regex !== '' && item.value != null && item.value !== '') {
                if (!item.value.match(new RegExp(item.regex))) {
                    val = false;
                    Notification.danger(item.regexErrorMessage ? item.regexErrorMessage : item.label + "不符合规范：" + item.regex);
                }
            }
            return val;
        },
        initChildOptionList: function (launchConfigurationItem, launchConfiguration) {
            if (launchConfigurationItem.source) {
                let values = [];
                let instanceType = {};
                launchConfiguration.forEach(function (item) {
                    if (item.name === launchConfigurationItem.source) {
                        instanceType = item;
                    }
                });
                let valueList = instanceType.value;

                if (!instanceType.optionList) return;
                instanceType.optionList.forEach(function (item) {
                    valueList.forEach(function (value) {
                        if (item[instanceType.valueField] === value) {
                            values.push(item);
                        }
                    });
                });
                launchConfiguration.forEach(function (p) {
                    if (p.source === launchConfigurationItem.source) {
                        p.optionList = values;
                    }
                });
                return values;
            }
        },
        // 字段变更事件
        selectOnChange: function ($scope, product, item) {
            let self = this;
            self.onChangeForInstanceType(product, item);
            self.onChangeInstanceTypeOptions(product, item);
            self.getLaunchConfigurationChildren($scope, product, item, true);
            self.onChangeDomain(product, item);
            self.onChangeChangePasswordPolicy(product, item);
            // EAST #Dzfg121705
            self.onChangeHostnamePolicy(product, item);
            // EAST
            self.onChangeVmNamePolicy(product, item);
        },
        // 实例类型变更事件，关联赋值CPU和内存字段
        onChangeForInstanceType: function (product, item) {
            if (item.name === "instanceType" && item.optionList) {
                let cpu = 0;
                let memory = 0;
                item.optionList.forEach(function (p) {
                    if (p.value === item.value) {
                        cpu = p.cpu;
                        memory = p.memory;
                    }
                });
                product.launchConfiguration.forEach(function (p) {
                    if (p.cpuSetting) {
                        p.value = cpu;
                    }
                    if (p.memorySetting) {
                        p.value = p.unit === 'MB' ? memory * 1024 : memory;
                    }
                });
            }
        },
        // 可选实例类型变更事件，联动改变实例类型下拉框内容
        onChangeInstanceTypeOptions: function (product, source) {
            let launchConfiguration = product.launchConfiguration;
            launchConfiguration.forEach(function (target) {
                if (target.source === source.name) {
                    let values = [];
                    // // 可选实例对象
                    let instanceType = {};
                    launchConfiguration.forEach(function (item) {
                        if (item.name === target.source) {
                            instanceType = item;
                        }
                    });
                    // 可选实例候的值
                    let valueList = instanceType.value;
                    instanceType.optionList.forEach(function (option) {
                        valueList.forEach(function (value) {
                            if (option[instanceType.valueField] === value) {
                                values.push(option);
                            }
                        });
                    });
                    target.optionList = values;
                    let exist = false;
                    target.optionList.forEach(function (option) {
                        if (option[instanceType.valueField] === target.value) {
                            exist = true;
                            return false;
                        }
                    });
                    if (!exist) {
                        target.value = null;
                    }
                    return false;
                }
            });
        },
        // 获取加域内容
        onChangeDomain: function (product, item) {
            let self = this;
            if (item.name === 'addDomain') {
                let index = self.getLaunchConfigurationItemIndex(product, item.name);
                if (index === -1) return;
                let domainName = self.getLaunchConfigurationItem(product, "domainName");
                let domainUserName = self.getLaunchConfigurationItem(product, "domainUserName");
                let domainUserPasswd = self.getLaunchConfigurationItem(product, "domainUserPasswd");

                if (item.value === true) {
                    if (domainName === undefined) {
                        domainName = {
                            name: "domainName",
                            inputType: "text",
                            label: "域",
                            role: "admin",
                            group: "netInfoGroup"
                        };
                        product.launchConfiguration.splice(index + 1, 0, domainName);
                    } else {
                        domainName.deleted = false;
                    }

                    if (domainUserName === undefined) {
                        domainUserName = {
                            name: "domainUserName",
                            inputType: "text",
                            label: "域用户名",
                            group: "netInfoGroup",
                            role: "admin"
                        };
                        product.launchConfiguration.splice(index + 3, 0, domainUserName);
                    } else {
                        domainUserName.deleted = false;
                    }

                    if (domainUserPasswd === undefined) {
                        domainUserPasswd = {
                            name: "domainUserPasswd",
                            inputType: "password",
                            label: "域用户密码",
                            group: "netInfoGroup",
                            role: "admin"
                        };
                        product.launchConfiguration.splice(index + 4, 0, domainUserPasswd);
                    } else {
                        domainUserPasswd.deleted = false;
                    }
                } else {
                    domainName.deleted = true;
                    domainUserName.deleted = true;
                    domainUserPasswd.deleted = true;
                }
            }
        },
        // 修改密码策略
        onChangeChangePasswordPolicy: function (product, item) {
            let self = this;
            if (item && item.name === 'changePasswordPolicy') {
                let pwdItem = self.getLaunchConfigurationItem(product, "loginPassword");
                if (!pwdItem) {
                    return;
                }
                if (item.value === 'dontChange') {
                    pwdItem.deleted = true;
                    pwdItem.value = null;
                } else {
                    delete pwdItem.deleted;
                }
            }

        },
        // 资源池标签变更事件
        onChangeResourcePoolTag: function ($scope, product, item) {
            let self = this;
            if (item.resourcePoolTag !== true) return;

            // 找到所有资源池标签对象
            let resourcePoolTags = [];
            let configuration = product.launchConfiguration;
            for (let i = 0; i < configuration.length; i++) {
                if (configuration[i].resourcePoolTag) {
                    resourcePoolTags.push(configuration[i]);
                }
            }

            // 获取已选标签，从上到下按顺序取，只取到当前选择对象的位置
            let tags = [], index = resourcePoolTags.length - 1;
            resourcePoolTags.forEach(function (tagItem, i) {
                if (tagItem.name === item.name) {
                    index = i;
                }
                if (i <= index && tagItem.value !== null) {
                    tags.push(tagItem.value);
                }
            });

            if (resourcePoolTags.length === tags.length) {
                return;
            }

            // 用已选择的标签获取其他标签候选值
            $scope.productEditLoadingLayer = HttpUtils.post("resource-pool-tag/match/" + product.platform, tags, function (response) {
                let index = -1;
                for (let i = 0; i < resourcePoolTags.length; i++) {
                    let tagItem = resourcePoolTags[i];
                    if (tagItem.name === item.name) {
                        index = i;
                    }
                    // 清空当前位置以下的资源池标签候选值
                    if (index !== -1 && i > index) {
                        tagItem.optionList = [];
                        tagItem.value = null;
                    }

                    // 更新下一位的资源池标签候选值
                    if (index !== -1 && i === index + 1 && item.value !== null) {
                        let change = resourcePoolTags[index + 1];
                        response.data.forEach(function (t) {
                            let tagKey = change.name.replace("resource_pool_tag_", "");
                            if (t.parent === tagKey) {
                                change.optionList.push({key: t.id, value: t.tagValue});
                            }
                        });
                    }
                }
            });
        }
        // EAST #Dzfg121705
        ,
        onChangeHostnamePolicy: function (product, item) {
            let self = this;
            if (item && item.name === 'hostnamePolicy') {
                let hostnameItem = self.getLaunchConfigurationItem(product, "hostname");
                let hostnameMacroItem = self.getLaunchConfigurationItem(product, "hostnameMacro");
                let hostnameMacroIndex = 0;
                if (!hostnameMacroItem) {
                    let index = self.getLaunchConfigurationItemIndex(product, "hostname");
                    let hostnameMacro = {
                        name: "hostnameMacro",
                        inputType: "text",
                        label: "hostname宏值",
                        role: "admin",
                        expression: true,
                        required: true,
                        value: ""
                    };
                    if (item.value === "macro") {
                        hostnameMacro.label = "hostname宏值";
                        hostnameMacro.description = "支持宏,${userInputHostname}为用户输入hostname宏.";
                    }
                    hostnameMacroIndex = index + 1;
                    product.launchConfiguration.splice(hostnameMacroIndex, 0, hostnameMacro);
                } else {
                    if (item.value === "macro") {
                        hostnameMacroItem.label = "hostname宏值";
                        hostnameMacroItem.description = "支持宏,${userInputHostname}为用户输入hostname宏.";
                    }
                    hostnameMacroIndex = self.getLaunchConfigurationItemIndex(product, "hostnameMacro");
                }
                if (item.value === 'sameWithVmName') {
                    hostnameItem.deleted = true;
                    hostnameItem.value = "";
                    product.launchConfiguration.splice(hostnameMacroIndex, 1);
                } else if (item.value === 'macro') {
                    delete hostnameItem.deleted;
                } else if (item.value === 'userInput') {
                    delete hostnameItem.deleted;
                    hostnameItem.value = "";
                    product.launchConfiguration.splice(hostnameMacroIndex, 1);
                }
            }
        },
        addHostnamePolicy: function (launchConfiguration, sourceLaunchConfiguration) {
            let self = this;
            let index = self.getLaunchConfigurationItemIndex({launchConfiguration: launchConfiguration}, "hostnamePolicy");
            if (index === -1) {
                return;
            }
            let hostnameMacro;
            if (angular.isDefined(sourceLaunchConfiguration)) {
                hostnameMacro = self.getLaunchConfigurationItem({launchConfiguration: sourceLaunchConfiguration}, "hostnameMacro");
            }
            if (hostnameMacro !== undefined) {
                launchConfiguration.splice(index + 1, 0, hostnameMacro);
            }
            self.onChangeHostnamePolicy({launchConfiguration: launchConfiguration}, self.getLaunchConfigurationItem({launchConfiguration: launchConfiguration}, "hostnamePolicy"));
        }
        // EAST
        ,
        // 修改机器名策略
        onChangeVmNamePolicy: function (product, item) {
            let self = this;
            if (item && item.name === 'vmNamePolicy') {
                let pwdItem = self.getLaunchConfigurationItem(product, "vmNameUser");
                if (!pwdItem) {
                    return;
                }
                if (item.value === 'standard') {
                    pwdItem.deleted = true;
                    pwdItem.value = null;
                } else {
                    delete pwdItem.deleted;
                }
            }

        },
    }
});
