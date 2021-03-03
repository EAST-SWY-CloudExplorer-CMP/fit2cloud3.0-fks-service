ProjectApp.directive("orderCopyContent", function (OrderService) {
    return {
        replace: true,
        template: '<div ng-include="url"></div>',
        scope: {
            currentOrder: "=",
        },
        link: function ($scope, element, attr, ctrl) {
            $scope.url = "project/html/order/order-copy-content.html";
            OrderService.initOrderProductInfo($scope.currentOrder);
        }
    };
});

ProjectApp.service("OrderService", function (HttpUtils) {
    let self = this;
    let getProductInfo = function (orderItem) {
        if (!orderItem.productId) {
            return;
        }
        orderItem.productInfo = {};
        return HttpUtils.get('product/get/' + orderItem.productId, function (response) {
            orderItem.productInfo = response.data;
        }, function (response) {
            Notification.alert(response.message)
        })
    };

    let getResourceInfo = function (orderItem) {
        HttpUtils.get('server/order-item/' + orderItem.id, function (response) {
            orderItem.serverInfo = response.data[0];
            getIp(orderItem.serverInfo);
        });
    };

    let getIp = function (item) {
        let ipList = [];
        if (item.ipArray) {
            let ips = angular.fromJson(item.ipArray);
            ips.forEach(function (value) {
                if (value === item.remoteIp) {
                    ipList.push({value: value, label: '(公)'})
                } else {
                    ipList.push({value: value})
                }
            });
        }
        item.ipList = ipList;
    };

    this.getDiskOptionList = function (editVmDisks, vm) {
        editVmDisks.forEach(function (diskItem) {
            HttpUtils.get('product/launch/configuration/account/' + vm.accountId + "/disk", function (diskResponse) {
                diskItem.diskConfig = diskResponse.data;
                diskItem.diskConfig.forEach(function (d) {
                    if (d.inputType !== 'hidden') d.value = diskItem[d.name];
                    if (d.name === 'diskSize') {
                        d.value = diskItem.newSize || diskItem.size;
                    }
                    if (d.method) {
                        HttpUtils.post('server/get/templateOptions/' + d.method + '/' + vm.id, {diskId: diskItem.diskId}, function (methodResponse) {
                            d.optionList = methodResponse.data;
                            if (d.value === undefined) {
                                if (d.inputType === 'multiSelect') {
                                    d.value = [];
                                } else {
                                    d.value = null;
                                    if ((!d.required) === false) {
                                        if (d.optionList.length > 0) {
                                            d.value = d.optionList[0][d.valueField];
                                            diskItem[d.name] = d.value;
                                        }
                                    }
                                }
                            } else {
                                if (d.inputType === 'combobox' && d.value) {
                                    let valueInOptionList = false;
                                    for (let i = 0; i < d.optionList.length; i++) {
                                        if (d.value === d.optionList[i][d.valueField]) {
                                            valueInOptionList = true;
                                            diskItem[d.name] = d.value;
                                        }
                                    }
                                    if (!valueInOptionList) {
                                        delete d.value;
                                    }
                                }
                                if (d.inputType === 'multiSelect' && d.value && d.value.length > 0) {
                                    let tempValue = [];
                                    for (let j = 0; j < d.value.length; j++) {
                                        let valueInOptionList = false;
                                        for (let i = 0; i < d.optionList.length; i++) {
                                            if (d.value[j] === d.optionList[i][d.valueField]) {
                                                valueInOptionList = true;
                                            }
                                        }
                                        if (valueInOptionList) {
                                            tempValue.push(d.value[j]);
                                        }
                                    }
                                    d.value = tempValue;
                                }
                            }
                        });
                    }
                });
            });
        });
    };

    this.initOrderProductInfo = function (order) {
        let orderItemList = order.orderItemList;
        var show = orderItemList.length > 1 ? false : true;
        for (let i = 0, len = orderItemList.length; i < len; i++) {
            let orderItem = orderItemList[i];
            orderItem.show = show;
            orderItem.details = angular.fromJson(orderItem.details);
            getProductInfo(orderItem);
            orderItem.customData = angular.fromJson(orderItem.customData);
            orderItem.tags = angular.fromJson(orderItem.tags);
        }
        order.orderItemList = orderItemList;
    };

    this.initDiskOrderProductInfo = function (order) {
        let orderItemList = order.orderItemList;
        for (let i = 0, len = orderItemList.length; i < len; i++) {
            let orderItem = orderItemList[i];
            orderItem.show = true;
            orderItem.details = angular.fromJson(orderItem.details);
            orderItem.details.currentText = angular.fromJson(orderItem.details.currentText);
            orderItem.details.updatedText = angular.fromJson(orderItem.details.updatedText);
            getProductInfo(orderItem);
            getResourceInfo(orderItem);
            orderItem.customData = angular.fromJson(orderItem.customData);
            orderItem.tags = angular.fromJson(orderItem.tags);
        }
        order.orderItemList = orderItemList;
    };

    this.initDiskEnlargeOrderProductInfo = function (order) {
        let orderItemList = order.orderItemList;
        let orderItem = orderItemList[0];
        orderItem.show = true;
        HttpUtils.get('cloud-disk/order-item/' + orderItem.id, function (response) {
            orderItem.diskInfo = response.data;
        });
        orderItem.details = angular.fromJson(orderItem.details);
        order.orderItemList = orderItemList;
    };

    this.initConfigUpdateOrderProductInfo = function (order) {
        let orderItemList = order.orderItemList;
        for (let i = 0, len = orderItemList.length; i < len; i++) {
            let orderItem = orderItemList[i];
            orderItem.show = true;
            orderItem.details = angular.fromJson(orderItem.details);
            orderItem.details.currentText = angular.fromJson(orderItem.details.currentText);
            orderItem.details.updatedText = angular.fromJson(orderItem.details.updatedText);
            getProductInfo(orderItem);
            getResourceInfo(orderItem);
            orderItem.customData = angular.fromJson(orderItem.customData);
            orderItem.tags = angular.fromJson(orderItem.tags);
        }
        order.orderItemList = orderItemList;
    };

    this.initVmDeleteOrderProductInfo = function (order) {
        let orderItemList = order.orderItemList;
        for (let i = 0, len = orderItemList.length; i < len; i++) {
            let orderItem = orderItemList[i];
            orderItem.show = true;
            orderItem.details = angular.fromJson(orderItem.details);
            getProductInfo(orderItem);
            getResourceInfo(orderItem);
            orderItem.customData = angular.fromJson(orderItem.customData);
            orderItem.tags = angular.fromJson(orderItem.tags);
        }
        order.orderItemList = orderItemList;
    };

    this.initExpiredTimeUpdateOrderProductInfo = function (order) {
        let orderItemList = order.orderItemList;
        for (let i = 0, len = orderItemList.length; i < len; i++) {
            let orderItem = orderItemList[i];
            orderItem.show = true;
            orderItem.details = angular.fromJson(orderItem.details);
            orderItem.details.currentText = angular.fromJson(orderItem.details.currentText);
            orderItem.details.updatedText = angular.fromJson(orderItem.details.updatedText);
            getProductInfo(orderItem);
            getResourceInfo(orderItem);
        }
        order.orderItemList = orderItemList;
    }
});

ProjectApp.controller('OrderController', function ($scope, OrderService, FilterSearch, $mdDialog, $document, $timeout, $state, HttpUtils, AuthService, Notification, UserService, $mdSidenav) {
    $scope.searchParam = angular.fromJson(sessionStorage.getItem("searchParam"));
    sessionStorage.removeItem("searchParam");

    $scope.conditions = [
        {key: "id", name: "订单编号", directive: "filter-contains"},
        {
            key: "status", name: "订单状态", directive: "filter-select", selects: [
                {value: 'UNCHECKED', label: '审批中'},
                {value: 'APPROVED', label: '已审批'},
                {value: 'TERMINATED', label: '已终止'},
                {value: 'CANCELED', label: '已作废'},
                {value: 'REJECTED', label: '已驳回'},
                {value: 'PROCESSING', label: '正在处理'},
                {value: 'FINISHED', label: '已完成'},
                {value: 'WARNING', label: '警告'},
                {value: 'ERROR', label: '异常'},
            ]
        },
        {
            key: "type", name: "订单类型", directive: "filter-select", selects: [
                {value: 'CREATE', label: '虚拟机申请'},
                {value: 'UPDATE', label: '虚拟机配置变更'},
                {value: 'DELETE', label: '虚拟机回收'},
                {value: 'DISK_UPDATE', label: '磁盘变更'},
                {value: 'SERVER_EXPIRE_UPDATE', label: '虚拟机续期申请'},
            ]
        },
        {key: "applyUser", name: "申请人", directive: "filter-contains"},
        {key: "cloudServerName", name: "资源名称", directive: "filter-input"},
        {key: "createTime", name: "申请时间", directive: "filter-date"},
        {
            key: "type", name: "订单类型", directive: "filter-select", selects: [
                {value: 'CREATE', label: '虚拟机申请'},
                {value: 'DELETE', label: '虚拟机回收'},
                {value: 'UPDATE', label: '虚拟机配置变更'},
                {value: 'SERVER_EXPIRE_UPDATE', label: '虚拟机续期申请'},
                {value: 'DISK_UPDATE', label: '磁盘变更'},
                {value: 'DISK_CREATE', label: '磁盘创建'},
                {value: 'DISK_ENLARGE', label: '磁盘扩容'},
            ]
        },
    ];

    // 用于传入后台的参数
    $scope.filters = [];
    if ($scope.searchParam) {
        if ($scope.searchParam.id) {
            $scope.filters.push({key: "id", name: "订单编号", value: $scope.searchParam.id});
        }
        if ($scope.searchParam.cloudServerName) {
            $scope.filters.push({key: "cloudServerName", name: "资源名称", value: $scope.searchParam.cloudServerName});
        }
    }
    $scope.isAdmin = UserService.isAdmin();
    $scope.isUser = UserService.isUser();
    if (!$scope.isUser) {
        $scope.conditions.push(
            {
                key: "workspaceId",
                name: "工作空间",
                directive: "filter-select-virtual",
                url: "workspace/listAll",
                search: true,
                convert: {value: "id", label: "name"}
            },
            {
                key: "organizationId",
                name: "组织",
                directive: "filter-select-virtual",
                url: "organization/listAll",
                search: true,
                convert: {value: "id", label: "name"}
            }
        )
    }

    $scope.columns = [
        {key: "type", value: "订单类型", checked: true, sort: false},
        {key: "id", value: "订单号", checked: true, sort: false},
        {key: "organization.name", value: "组织", checked: true},
        {key: "workspace_id", value: "工作空间", checked: true, sort: false},
        {key: "create_time", value: "申请时间", checked: true, sort: false},
        {key: "name", value: "申请人", checked: true, sort: false},
        {key: "status", value: "状态", checked: true, sort: false},
        {key: "relate_resource", value: "相关资源", checked: true, sort: false},
        {value: "", default: true, sort: false}
    ];
    $scope.timeOutPromises = [];

    $scope.model = {
        formUrl: "project/html/task/NO-SET.html",
        showType: "view",
    };

    $scope.showOrderDetail = function (order, type) {
        $scope.type = type;
        $scope.model.showType = type;
        switch (order.type) {
            case 'CREATE':
                $scope.orderLoadingLayer = $scope.getOrderDetail(order.id, OrderService.initOrderProductInfo);
                $scope.formUrl = 'project/html/order/order-view.html' + '?_t=' + Math.random();
                break;
            case 'DISK_UPDATE':
                $scope.orderLoadingLayer = $scope.getOrderDetail(order.id, OrderService.initDiskOrderProductInfo);
                $scope.formUrl = 'project/html/order/order-cloud-disk-view.html' + '?_t=' + Math.random();
                break;
            case 'DISK_CREATE':
                $scope.orderLoadingLayer = $scope.getOrderDetail(order.id, OrderService.initDiskEnlargeOrderProductInfo);
                $scope.formUrl = 'project/html/order/order-cloud-disk-create-view.html' + '?_t=' + Math.random();
                break;
            case 'DISK_ENLARGE':
                $scope.orderLoadingLayer = $scope.getOrderDetail(order.id, OrderService.initDiskEnlargeOrderProductInfo);
                $scope.formUrl = 'project/html/order/order-cloud-disk-enlarge-view.html' + '?_t=' + Math.random();
                break;
            case 'UPDATE':
                $scope.orderLoadingLayer = $scope.getOrderDetail(order.id, OrderService.initConfigUpdateOrderProductInfo);
                $scope.formUrl = 'project/html/order/order-config-update-view.html' + '?_t=' + Math.random();
                break;
            case 'DELETE':
                $scope.orderLoadingLayer = $scope.getOrderDetail(order.id, OrderService.initVmDeleteOrderProductInfo);
                $scope.formUrl = 'project/html/order/order-vm-delete-view.html' + '?_t=' + Math.random();
                break;
            case 'SERVER_EXPIRE_UPDATE':
                $scope.orderLoadingLayer = $scope.getOrderDetail(order.id, OrderService.initExpiredTimeUpdateOrderProductInfo);
                $scope.formUrl = 'project/html/order/order-expired-time-view.html' + '?_t=' + Math.random();
                break;
            default:
                return;
        }
        $scope.toggleForm();
    };

    $scope.show = function (orderItem) {
        orderItem.show = !orderItem.show;
    };

    $scope.showDiskDetail = function (item) {
        item.show = (item.show === undefined || item.show === false);
    };

    $scope.isShowConfigUpdateItem = function (d) {
        return d.instanceTypeSetting || d.cpuSetting || d.memorySetting
    };

    $scope.getOrderDetail = function (businessKey, callback) {
        if ($scope.currentOrder) {
            delete $scope.currentOrder.applyUser
        }
        return HttpUtils.get('order/detail/readonly/' + businessKey, function (response) {
            let currentOrder = response.data;
            $scope.currentProduct = currentOrder;
            $scope.currentOrder = currentOrder;
            if (callback && angular.isFunction(callback)) {
                callback(currentOrder);
            }
        }, function (response) {
            Notification.alert(response.message)
        })
    };

    $scope.getExtendInfo = function (item) {
        let itemInNewQueryResult = false;
        $scope.items.forEach(function (order) {
            if (item && order.id === item.id) {
                itemInNewQueryResult = true;
            }
        });
        if (itemInNewQueryResult === false) {
            return;
        }
        HttpUtils.get('order/extendinfo/' + item.id, function (response) {
            item.resources = {};
            item.vmCount = response.data.vmCount;
            item.ifDisk = response.data.ifDisk;
            item.organizationName = response.data.organizationName;
            if (response.data.status) {
                item.status = response.data.status;
                if (item.status === "PROCESSING" || item.status === "APPROVED") {
                    let promise = $timeout(function () {
                        $scope.getExtendInfo(item);
                    }, 5000);
                    $scope.timeOutPromises.push(promise);
                }
            }
        }, function () {
            item.resources = {};
        });
    };

    $scope.showOrderLog = function (order) {
        $scope.showLogOrderId = order.id;
        $scope.formUrl = 'project/html/order/order-log.html' + '?_t=' + Math.random();
        $scope.toggleForm();
    };

    $scope.copyOrder = function (order) {
        if (order) {
            Notification.info('敬请期待!');
            return;
        }
        $scope.childLoadingLayer = $scope.getOrderDetail(order.id, function (order) {
            $scope.currentOrder = angular.copy(order);
            $mdDialog.show({
                templateUrl: 'project/html/order/order-copy.html' + '?_t=' + window.appversion,
                parent: angular.element($document[0].body),
                scope: $scope,
                preserveScope: true,
                clickOutsideToClose: false
            });
        });
    };

    $scope.cancelOrder = function (item) {
        Notification.confirm('确认废除该订单？', function () {
            $scope.orderLoadingLayer = HttpUtils.post('order/cancel/' + item.id, {}, function () {
                Notification.info('操作成功');
                //刷新页面重写获取订单状态
                $scope.list();
            }, function (response) {
                Notification.danger(response.message);
            })
        });
    };

    $scope.changeSubmit = function (type) {
        if (type !== 'view') {
            let currentOrder = angular.copy($scope.currentOrder);
            let request = {
                order: currentOrder,
            };

            //高级选项修改的订单json添加到请求中
            request.orderItems = [];
            $scope.currentOrder.orderItemList.forEach(function (orderItem) {
                if (orderItem.edit) {
                    request.orderItems.push({
                        id: orderItem.id,
                        details: angular.toJson(orderItem.details)
                    });
                }
            });
            $scope.orderLoadingLayer = HttpUtils.post('order/' + type + '/' + currentOrder.id, request, function () {
                Notification.info('操作成功');
                $scope.closeForm();
                //刷新页面重写获取订单状态
                $scope.list();
            }, function (response) {
                Notification.danger(response.message);
            })
        }
    };

    $scope.toggleForm = function () {
        $mdSidenav("right-1").open();
    };

    $scope.closeForm = function () {
        $mdSidenav("right-1").close();
        delete $scope.logs;
    };

    $scope.closeForm2 = function () {
        for (let i = 0; i < $scope.currentOrder.orderItemList.length; i++) {
            $mdSidenav($scope.currentOrder.orderItemList[i].id).close();
        }
    };

    $scope.closeDialog = function () {
        $mdDialog.cancel();
    };

    $scope.goResource = function (item) {
        if (item.ifDisk) {
            sessionStorage.setItem("orderDiskParam", angular.toJson({
                    label: item.name,
                    value: item.id
                }
            ));
            $state.go("disk");
        } else {
            sessionStorage.setItem("orderServerParam", angular.toJson({
                    label: item.name,
                    value: item.id
                }
            ));
            $state.go("server");
        }
    };

    $scope.$on("$destroy", function () {
        $scope.clearTimeoutPromises();
    });

    $scope.clearTimeoutPromises = function () {
        if ($scope.timeOutPromises) {
            $scope.timeOutPromises.forEach(function (promise) {
                $timeout.cancel(promise);
            });
            $scope.timeOutPromises = [];
        }
    };

    $scope.list = function (sortObj) {
        // let condition = FilterSearch.convert($scope.filters);
        // if (sortObj || $scope.sort) {
        //     $scope.sort = sortObj || $scope.sort;
        // }
        // if ($scope.sort) {
        //     condition.sort = $scope.sort.sql;
        // }
        // condition = condition ? condition : {};
        // HttpUtils.paging($scope, 'order/list', condition, $scope.clearTimeoutPromises)
    };

    $scope.list();
});

ProjectApp.controller('OrderItemLogController', function ($scope, HttpUtils, $interval) {
    $scope.uri = "";
    $scope.id = "";
    if ($scope.showLogResourceId) {
        $scope.uri = "order/log/resourceId/";
        $scope.id = $scope.showLogResourceId;
    }
    if ($scope.showLogOrderId) {
        $scope.uri = "order/log/orderId/";
        $scope.id = $scope.showLogOrderId;
    }

    $scope.orderItemLogDTOs = [];

    $scope.destroyTimer = function () {
        if ($scope.timer) {
            $interval.cancel($scope.timer);
        }
    };

    $scope.$on("$destroy", function () {
        $scope.destroyTimer();
    });

    $scope.getLogs = function () {
        HttpUtils.get($scope.uri + $scope.id, function (response) {
            $scope.orderItemLogDTOs = response.data;
            let refresh = true;
            if ($scope.orderItemLogDTOs.length === 0) {
                refresh = false;
            }
            if (refresh && !$scope.timer) {
                $scope.timer = $interval($scope.getLogs, 5000);
            }
        });
    };
    $scope.getLogs();

});
