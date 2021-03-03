ProjectApp.directive('catalogItem', function () {
    return {
        replace: true,
        scope: {
            submit: '&',
            detail: '=',
        },
        templateUrl: function (elem, attr) {
            return attr.templateUrl || "project/html/cluster-product/cluster-product-item.html" + '?_t=' + window.appversion
        },
        link: function (scope, element) {
        }
    }
});

ProjectApp.controller('CatalogProductController', function ($scope, FilterSearch, HttpUtils, Notification, $mdDialog) {
    $scope.background = "/web-public/fit2cloud/html/background/background.html?_t" + window.appversion;
    $scope.columns = [
        {key: "processCreator", value: "申请人", checked: true},
        {key: "businessKey", value: "申请单号", checked: true},
        {key: "businessType", value: "流程名称", checked: true},
        {key: "taskName", value: "任务名称", checked: true},
        {key: "taskStartTime", value: "开始时间", checked: true},
        {value: "", sort: false, default: true, width: '10%'}
    ];
    $scope.condition = {
        order: 'name',
        tagKey: 'ALL',
    };
    $scope.customData = {};

    $scope.orders = [
        {key: 'name', value: '按名称排序'},
        {key: 'platform', value: '按云平台排序'},
        {key: 'iconUrl', value: '按操作系统排序'},
    ];

    $scope.expiredTimeTypes = [
        {key: 7, value: '一周'},
        {key: 30, value: '一个月'},
        {key: 90, value: '三个月'},
        {key: 180, value: '半年'},
        {key: 365, value: '一年'},
        {key: 'custom', value: '自定义'},
        {key: 'never', value: '永不到期'}
    ];

    $scope.changeExpiredTimeType = function (expiredTimeType) {
        if (expiredTimeType !== 'custom' && expiredTimeType !== 'never') {
            let today = new Date();
            today.setHours(23);
            today.setMinutes(59);
            today.setSeconds(59);
            today.setMilliseconds(999);
            $scope.customData.expiredTime = moment(today.getTime() + expiredTimeType * 24 * 3600 * 1000).toDate();
        }
        if (expiredTimeType === 'never') {
            $scope.customData.expiredTime = null;
        }
    };

    $scope.productTags = function () {
        // $scope.productTags = [];
        // var obj = {tagKey: "9780d06c-ca20-4500-affb-50db6a44fb83", tagName: "test", index: 1};
        // $scope.productTags.push(obj);

        // $scope.loadingLayer = HttpUtils.get('tag/product/list', function (response) {
        //     $scope.productTags = response.data;
        // }, function (response) {
        //     Notification.danger('获取产品标签失败, 错误: ' + response.message);
        // })
    };

    $scope.changeProductTag = function (tagKey) {
        $scope.condition.tagKey = tagKey;
        if (!$scope.products) {
            return;
        }
        if (tagKey === 'ALL') {
            for (let i = 0; i < $scope.products.length; i++) {
                $scope.products[i].show = true;
            }
        } else {
            for (let i = 0; i < $scope.products.length; i++) {
                let product = $scope.products[i];
                if (product.tags && $.inArray(tagKey, product.tags) !== -1) {
                    product.show = true;
                } else {
                    product.show = false;
                }
            }
        }
    };

    $scope.processLaunchConfiguration = function () {
        for (let i = 0, len = $scope.currentProduct.launchConfiguration.length; i < len; i++) {
            let item = $scope.currentProduct.launchConfiguration[i];
            if (item.parent !== true && $scope.ifShow(item) && !$scope.isResourcePoolTag(item)) {
                LaunchConfigurationService.getLaunchConfigurationOption($scope, $scope.currentProduct, item, false);
            }
        }
    };

    $scope.ifShow = function (item) {
        if (!item) return;

        if (item.cpuSetting === true || item.memorySetting === true) {
            return false;
        }

        if (item.deleted === true) {
            return false;
        }

        return item.role === 'user';
    };

    $scope.isResourcePoolTag = function (item) {
        return item && item.resourcePoolTag === true;
    };

    $scope.valRequired = function (item) {
        // 可编辑状态时验证
        if ($scope.ifShow(item)) {
            return LaunchConfigurationService.valRequired(item, 'user');
        }

        return true;
    };

    $scope.validateResourcePoolTags = function () {
        $scope.productEditLoadingLayer = HttpUtils.post("resource-pool-tag/validate/tags", $scope.currentProduct, function (response) {
            if (response.success) {
                $scope.wizard.continue();
            } else {
                Notification.danger(response.message);
            }
        }, function (response) {
            Notification.danger(response.message);
        });
    };

    $scope.selectOnChange = function (item) {
        LaunchConfigurationService.selectOnChange($scope, $scope.currentProduct, item);
        LaunchConfigurationService.onChangeResourcePoolTag($scope, $scope.currentProduct, item);
        // EAST Dht121703
        if (!$scope.currentProduct.diskSize && $scope.currentProduct.platform === 'fit2cloud-vsphere-plugin') {
            HttpUtils.post('ext/images/available', $scope.currentProduct, function (res) {
                if (res.data.str !== "") {
                    let diskSizeItem = LaunchConfigurationService.getLaunchConfigurationItem($scope.currentProduct, "diskSize");
                    diskSizeItem.description = "系统盘大小: " + res.data.str + diskSizeItem.unit + " , 此申请空间为数据盘大小不包含系统盘";
                    $scope.currentProduct.diskSize = res.data.str;
                }
            })
        }
        // EAST
    };

    $scope.apply = function (product) {
        $scope.show = true;
        $scope.formUrl = 'project/html/cluster-product/cluster-product-apply.html' + '?_t=' + window.appversion;
        $scope.toggleForm();
        $scope.productEditLoadingLayer = HttpUtils.get('catalog-product/detail/' + product.id, function (response) {
            $scope.currentProduct = response.data;
            $scope.customData.expiredTimeType = 'never';
            $scope.customData.expiredTime = null;
            $scope.customData.remark = null;
            $scope.currentProduct.launchConfiguration = angular.fromJson($scope.currentProduct.launchConfiguration);
            // instanceTypeOptions sort
            let instanceTypeOptions = LaunchConfigurationService.getLaunchConfigurationItem($scope.currentProduct, "instanceTypeOptions");
            if (instanceTypeOptions && instanceTypeOptions.optionList) {
                instanceTypeOptions.optionList = instanceTypeOptions.optionList.sort(function (v1, v2) {
                    return v1.cpu - v2.cpu && v1.memory - v2.memory;
                });
            }
            let extendData = angular.fromJson($scope.currentProduct.extendData);
            $scope.currentProduct.extendData = extendData;
            $scope.customData.middlewareIds = extendData.middlewareIds;
            $scope.customData.selectMiddlewareList = extendData.middlewareList;
            $scope.listMiddleware();
            $scope.processLaunchConfiguration();
            $scope.request = {count: 1};
        }, function (response) {
            Notification.danger('获取产品信息失败, 错误: ' + response.message);
        });
    };

    $scope.view = function () {
        EyeService.view('#password1', '#eye1');
    };

    $scope.listMiddleware = function () {
        let extendDataJsonObj = $scope.currentProduct.extendData;
        let vm_os = extendDataJsonObj.vm_os;
        let vm_os_version = extendDataJsonObj.vm_os_version;
        $scope.productEditLoadingLayer = HttpUtils.get('middleware/get/' + vm_os + '/' + vm_os_version, function (response) {
            let middlewareList = response.data;
            let list = [];
            for (let k = 0; k < middlewareList.length; k++) {
                let middleware = {
                    id: middlewareList[k].id,
                    name: middlewareList[k].name,
                    parameters: angular.fromJson(middlewareList[k].parameter)
                };
                if (extendDataJsonObj.middlewareIds) {
                    extendDataJsonObj.middlewareIds.forEach(function (id) {
                        if (middleware.id === id) {
                            middleware.name = middleware.name + " [产品标准中间件]";
                            middleware.disabled = true;
                            return false;
                        }
                    });
                }
                list.push(middleware);
            }

            $scope.middlewareList = list;
            if (list.length === 0) {
                $scope.customData.middlewareIds = [];
                $scope.customData.selectMiddlewareList = [];
            }
        })
    };

    $scope.changeMiddleware = function () {
        if (!$scope.customData.middlewareIds || $scope.customData.middlewareIds.length === 0) {
            $scope.customData.selectMiddlewareList = [];
            return;
        }
        let selectList = $scope.middlewareList;
        let newList = [];
        if ($scope.currentProduct && $scope.currentProduct.extendData) {
            let extendDataJsonObj = $scope.currentProduct.extendData;
            if (extendDataJsonObj.middlewareList) {
                newList = angular.copy(extendDataJsonObj.middlewareList);
            }
        }

        $scope.customData.middlewareIds.forEach(function (middlewareId) {
            selectList.forEach(function (selectMiddleware) {
                if (middlewareId === selectMiddleware.id) {
                    let exist = false;
                    newList.forEach(function (m) {
                        if (m.id === middlewareId) {
                            exist = true;
                        }
                    });
                    if (!exist) newList.push(selectMiddleware);
                }
            });
        });

        $scope.customData.selectMiddlewareList = newList;
    };

    $scope.calendarDateFilter = function(date) {
        if (date) {
            let now = new Date();
            return (date.getTime() + 86400000 - 1) > now.getTime();
        }
        return false;
    };

    $scope.wizard = {
        setting: {
            title: "标题",
            subtitle: "子标题",
            closeText: "取消",
            submitText: "提交",
            nextText: "下一步",
            prevText: "上一步",
            buttons: [
                {
                    text: "添加至清单",
                    class: "md-primary md-raised",
                    click: function () {
                        let valid = true;
                        if ($scope.currentProduct.selectTags) {
                            $scope.currentProduct.selectTags.forEach(function (tag) {
                                //验证tag.tagId不为空是为了在点击添加标签后不选择标签也可以通过验证
                                if (!tag.tagValueId && tag.tagId) {
                                    Notification.info('标签' + tag.tagAlias + "未选择标签值");
                                    valid = false;
                                }
                            });
                        }
                        if (valid) {
                            $scope.submitToCart();
                        }
                    },
                    show: function () {
                        return $scope.wizard.isLast() || $scope.wizard.current === 3;
                    },
                    disabled: function () {
                        return $scope.wizard.current === 3;
                    }
                },
                {
                    text: "提交",
                    class: "md-success md-raised",
                    click: function () {
                        $scope.wizard.submit();
                    },
                    show: function () {
                        return $scope.wizard.isLast() || $scope.wizard.current === 3;
                    },
                    disabled: function () {
                        return $scope.wizard.current === 3;
                    }
                }
            ]
        },
        // 按顺序显示,id必须唯一并需要与页面中的id一致，select为分步初始化方法，next为下一步方法(最后一步时作为提交方法)
        steps: [
            {
                id: "1",
                name: "基本信息",
                select: function () {
                },
                next: function () {
                    let requiredValidated = true;
                    $scope.currentProduct.launchConfiguration.forEach(function (item) {
                        if (!$scope.valRequired(item)) {
                            requiredValidated = false;
                        }
                    });
                    if (requiredValidated === false) {
                        return false;
                    }

                    $scope.validateResourcePoolTags();
                    return false;
                }
            },
            {
                id: "2",
                name: "其他信息",
                select: function () {
                },
                next: function () {
                    if ($scope.customData.expiredTimeType === 'custom' && !$scope.customData.expiredTime) {
                        Notification.info('请选择租期');
                        return false;
                    }
                    //验证选择的日期是否小于当前时间
                    if ($scope.customData.expiredTimeType === 'custom') {
                        let today = new Date();
                        // md-calendar控件以选中日期的第一秒为时间
                        let expiredTime = $scope.customData.expiredTime.getTime() + 86400000 - 1;
                        if(today.getTime() >= expiredTime) {
                            Notification.info('到期时间不能小于等于当前时间');
                            return false;
                        }
                    }
                    let middleware = $scope.customData.selectMiddlewareList;
                    let valid = true;
                    if (middleware) {
                        middleware.forEach(function (item) {
                            if (item.parameters) {
                                for (let i = 0; i < item.parameters.length; i++) {
                                    if (!item.parameters[i].value && item.parameters[i].required) {
                                        Notification.info('中间件' + item.name + '参数: ' + item.parameters[i].name + "必填");
                                        valid = false;
                                    }
                                }
                            }
                        })
                    }
                    return valid;
                }
            },
            {
                id: "3",
                name: "标签信息",
                select: function () {
                },
                next: function () {
                    let valid = true;
                    if ($scope.customData.remark && $scope.customData.remark.length > 64) {
                        Notification.info('备注不能超过64个字符');
                        return false;
                    }
                    if (!$scope.request.description) {
                        Notification.info('请填写申请原因');
                        return false;
                    }
                    if ($scope.request.description.length > 255) {
                        Notification.info('申请原因不能超过255个字符');
                        return false;
                    }
                    if ($scope.currentProduct.selectTags) {
                        $scope.currentProduct.selectTags.forEach(function (tag) {
                            //验证tag.tagId不为空是为了在点击添加标签后不选择标签也可以通过验证
                            if (!tag.tagValueId && tag.tagId) {
                                Notification.info('标签' + tag.tagAlias + "未选择标签值");
                                valid = false;
                            }
                        });

                        for (let i = 0; i < $scope.currentProduct.selectTags.length - 1; i++) {
                            let item = $scope.currentProduct.selectTags[i];
                            for (let j = i + 1; j < $scope.currentProduct.selectTags.length; j++) {
                                if (item.tagKey === $scope.currentProduct.selectTags[j].tagKey) {
                                    Notification.info('标签' + item.tagAlias + "重复");
                                    valid = false;
                                }
                            }
                        }
                    }
                    if (valid) {
                        $scope.submit();
                    }
                    return valid;
                }
            },
        ],
        // 嵌入页面需要指定关闭方法
        close: function () {
            $scope.closeToggleForm();
            $scope.show = false;
            // 关闭向导时删除所有的 danger info warn 信息
            $('#_notification').remove()
        }
    };

    $scope.submitToCart = function () {
        let tags = [];
        $scope.currentProduct.selectTags.forEach(function (tag) {
            if (tag.tagId && tag.tagKey) {
                tags.push({tagKey: tag.tagKey, tagValueId: tag.tagValueId});
            }
        });
        //保存产品高级选项到订单的customData
        if($scope.currentProduct.extendData) {
            $scope.customData.advanceOptions = $scope.currentProduct.extendData.advanceOptions;
        }
        delete $scope.currentProduct.extendData;
        $scope.currentProduct.launchConfiguration = angular.toJson($scope.currentProduct.launchConfiguration);
        $scope.request.product = $scope.currentProduct;
        if ($scope.customData.expiredTime) {
            $scope.customData.expiredTime = $scope.customData.expiredTime.getTime();
            $scope.customData.expiredTime += 86400000 - 1;// 当天的最后一毫秒
        }
        $scope.request.customData = angular.toJson($scope.customData);
        $scope.request.tagMappings = tags;

        $scope.productEditLoadingLayer = HttpUtils.post('order/add-to-cart', $scope.request, function () {
            Notification.success('已添加至清单');
            $scope.closeToggleForm();
            $scope.list();
            $('#_notification').remove();
            $scope.show = false;
        });
    };

    $scope.closeToggleForm = function () {
        $scope.toggleForm();
        $scope.currentProduct = {};
    };

    $scope.submit = function () {
        let tags = [];
        let product = angular.copy($scope.currentProduct);
        let customData = angular.copy($scope.customData);
        product.selectTags.forEach(function (tag) {
            if (tag.tagId && tag.tagKey) {
                tags.push({tagKey: tag.tagKey, tagValueId: tag.tagValueId});
            }
        });
        product.launchConfiguration = angular.toJson(product.launchConfiguration);
        //保存产品高级选项到订单的customData
        if(product.extendData) {
            customData.advanceOptions = product.extendData.advanceOptions;
        }
        delete product.extendData;
        $scope.request.product = product;
        if (customData.expiredTime) {
            customData.expiredTime = customData.expiredTime.getTime();
            customData.expiredTime += 86400000 - 1;// 当天的最后一毫秒
        }
        $scope.request.customData = angular.toJson(customData);
        $scope.request.tagMappings = tags;

        $scope.productEditLoadingLayer = HttpUtils.post('order/apply', $scope.request, function () {
            Notification.success('申请成功');
            $scope.closeToggleForm();
            $scope.list();
            $('#_notification').remove();
            $scope.show = false;
        });
    };

    $scope.list = function () {
        // $scope.loadingLayer = HttpUtils.get('catalog-product/list', function (response) {
            //$scope.products = response.data;
            $scope.products = [];
            if($scope.condition.tagKey !== 'ALL') {
                $scope.changeProductTag($scope.condition.tagKey)
            }
        // }, function (response) {
        //     Notification.danger('获取产品失败, 错误: ' + response.message);
        // })
    };

    $scope.productTags();
    $scope.list();

    //
    $scope.getProductInfo = function (orderItem) {
        orderItem.productInfo = {};
        $scope.loadingLayer = HttpUtils.get('product/get/' + orderItem.productId, function (data) {
            orderItem.productInfo = data.data;
        });
    };

    $scope.showItem = function (item) {
        item.show = !item.show;
    };

    $scope.clearCart = function (orderItem) {
        let message = '是否清空清单列表?';
        let orderItemIds = $scope.orderItemIds;
        if (orderItem) {
            message = '是否删选择项?';
            orderItemIds = [orderItem.id];
        }
        Notification.confirm(message, function () {
            $scope.loadingLayer = HttpUtils.post('order/clear/cart', orderItemIds, function (data) {
                Notification.success('删除成功');
                $scope.getMyCart();
            });
        });
    };

    $scope.submitCart = function () {
        if (!$scope.orderItemIds || $scope.orderItemIds.length === 0) {
            Notification.info('请先添加产品到清单');
            return;
        }
        let obj = {
            title: '申请原因',
            text: '申请原因',
            placeholder: '请填写申请原因',
            required: true
        };
        Notification.prompt(obj, function (result) {
            let orderItemList = angular.copy($scope.orderItemList);
            orderItemList.forEach(function (orderItem) {
                orderItem.description = result;
                orderItem.details = angular.toJson(orderItem.details);
                orderItem.tags = angular.toJson(orderItem.tags);
                orderItem.customData = angular.toJson(orderItem.customData);
                orderItem.productInfo = angular.toJson(orderItem.productInfo);
            });
            $scope.loadingLayer = HttpUtils.post('order/submit/cart', orderItemList, function (data) {
                Notification.success('提交成功');
                $scope.getMyCart();
            });
        });

    };

    $scope.getMyCart = function () {
        // $scope.loadingLayer = HttpUtils.get('order/cart', function (response) {
        //     let orderItemList = response.data;
        //     let serverItemIds = [], orderItemIds = [];
        //     for (let i in orderItemList) {
        //         orderItemList[i].show = true;
        //         orderItemList[i].details = angular.fromJson(orderItemList[i].details);
        //         orderItemList[i].customData = angular.fromJson(orderItemList[i].customData);
        //         orderItemList[i].tagsJsonStr = orderItemList[i].tags;
        //         orderItemList[i].tags = angular.fromJson(orderItemList[i].tags);
        //         $scope.getProductInfo(orderItemList[i]);
        //         serverItemIds.push(orderItemList[i].id);
        //         orderItemIds.push(orderItemList[i].id);
        //     }
        //     $scope.orderItemList = orderItemList;
        //     $scope.orderItemIds = orderItemIds;
        // })
    };

    $scope.getMyCart();
});

ProjectApp.controller('CloudServerTagController', function ($scope, $log, HttpUtils, Notification, AuthService) {
    $scope.listTags = function () {
        $scope.loading = HttpUtils.get("tag/listAll/current", function (response) {
            $scope.tags = response.data;
            if ($scope.addItem.length === 0) {
                $scope.initTag();
            }
        }, function (response) {
            $log.error(response);
        });
    };

    $scope.addItem = [];
    if ($scope.currentProduct.selectTags) {
        $scope.addItem = $scope.currentProduct.selectTags;
    } else {
        $scope.currentProduct.selectTags = $scope.addItem;
    }

    $scope.initTag = function () {
        let add = false;
        for (let i = 0; i < $scope.tags.length; i++) {
            if ($scope.tags[i].required) {
                let addItem = angular.copy($scope.tags[i]);
                addItem.values = $scope.tags[i].tagValues;
                $scope.addItem.push(addItem);
                add = true;
            }
        }
        if (add) {
            $scope.editing = true;
        }
    };

    $scope.addTag = function () {
        $scope.editing = true;
        $scope.addItem.push({});
    };

    $scope.changeTag = function (item) {
        let tags = $scope.tags;

        for (let i = 0; i < tags.length; i++) {
            if (tags[i].tagKey === item.tagKey) {
                item.tagId = tags[i].tagId;
                item.tagAlias = tags[i].tagAlias;
                item.values = tags[i].tagValues;
                break;
            }
        }
        $scope.checkDuplicate();
    };

    $scope.deleteTag = function (index) {
        $scope.addItem.splice(index, 1);
        $scope.editing = true;

        if ($scope.addItem.length === 0) {
            $scope.editing = false;
            return;
        }
        $scope.checkDuplicate();
    };

    $scope.checkDuplicate = function () {
        let addItem = $scope.addItem;

        for (let i = 0; i < addItem.length; i++) {
            addItem[i].duplicate = false;
        }
        $scope.duplicate = false;
        for (let i = 0; i < addItem.length - 1; i++) {
            addItem[i].duplicates = false;
            for (let j = i + 1; j < addItem.length; j++) {
                if (addItem[i].tagKey === addItem[j].tagKey) {
                    addItem[i].duplicate = true;
                    addItem[j].duplicate = true;
                    $scope.duplicate = true;
                }
            }
        }
    };

    $scope.checkRequired = function (tag) {
        if ($scope.tags) {
            for (let i = 0; i < $scope.tags.length; i++) {
                if (tag.tagKey === $scope.tags[i].tagKey) {
                    return $scope.tags[i].required;
                }
            }
            return false;
        }
    };

    $scope.changeTagValue = function () {
        $scope.editing = true;
    };

    $scope.listTags();

    $scope.checkPermission = function (permission) {
        return !AuthService.hasPermission(permission);
    }
});