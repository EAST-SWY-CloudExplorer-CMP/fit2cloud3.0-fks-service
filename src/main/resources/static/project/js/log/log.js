ProjectApp.controller('SystemLogController', function ($scope, $mdDialog, HttpUtils, FilterSearch, $document, Notification) {
    $scope.moduleToLogParam = angular.fromJson(sessionStorage.getItem("ModuleToLogParam"));
    sessionStorage.removeItem("ModuleToLogParam");
    $scope.accountToLogParam = angular.fromJson(sessionStorage.getItem("AccountToLogParam"));
    sessionStorage.removeItem("AccountToLogParam");

    $scope.conditions = [
        {
            key: "module",
            name: "模块",
            search: true,
            directive: "filter-select-virtual",
            url: 'module/system/list',
            convert: {value: "id", label: "name"}
        },
        {
            key: "level", name: "级别", directive: "filter-select", selects: [
                {value: "DEBUG", label: "DEBUG"},
                {value: "INFO", label: "INFO"},
                {value: "WARN", label: "WARN"},
                {value: "ERROR", label: "ERROR"}
            ]
        },
        {key: "logTime", name: "时间", directive: "filter-date"},
        {key: "message", name: "详情", directive: "filter-input"}
    ];
    $scope.filters = [];

    if ($scope.moduleToLogParam) {
        $scope.filters = [{
            key: "module",
            name: "模块",
            label: $scope.moduleToLogParam.label,
            value: $scope.moduleToLogParam.value
        }];
    }

    if ($scope.accountToLogParam) {
        $scope.filters.push({
            key: "level",
            name: "级别",
            label: "ERROR",
            value: "ERROR"
        });
        $scope.filters.push({
            key: "message",
            name: "详情",
            label: $scope.accountToLogParam.label,
            value: '%' + $scope.accountToLogParam.value + '%'
        });
    }

    $scope.columns = [
        {value: "详情", key: "message", sort: false},
        {value: "时间", key: "logTime", sort: false},
        {value: "级别", key: "level", sort: false},
        {value: "模块", key: "module", sort: false},
        {value: "主机", key: "host", sort: false, checked: false}
    ];

    $scope.showDetail = function (item) {
        $scope.items.filter(function (n) {
            return item.id !== n.id;
        }).forEach(function (n) {
            n.selected = false;
        });
        if (item.selected) {
            $scope.closeInformation();
            item.selected = false;
            return;
        }
        $scope.detail = item;
        $scope.infoUrl = 'project/html/log/system-log-detail.html' + '?_t=' + window.appversion;
        $scope.toggleInfoForm(true);
        item.selected = true;
    };

    $scope.closeInformation = function () {
        $scope.toggleInfoForm(false);
        $scope.items.forEach(function (n) {
            n.selected = false;
        });
    };

    //绑定click事件
    $document.on("click", function (event) {
            var inTable = false, inSidenav = false, isDialog = false;
            $.each($(event.target).parents(), function (index, item) {
                if (item.nodeName.toUpperCase() === 'TABLE') {
                    inTable = true;
                }
                if (item.nodeName.toUpperCase() === 'MD-SIDENAV') {
                    inSidenav = true;
                }
                if (item.nodeName.toUpperCase() === 'MD-DIALOG') {
                    isDialog = true;
                }
            });
            $.each($(event.target), function (index, item) {
                if (item.nodeName.toUpperCase() === 'TABLE') {
                    inTable = true;
                }
                if (item.id.toUpperCase() === 'INFO_FORM') {
                    inSidenav = true;
                }
                if (item.nodeName.toUpperCase() === 'MD-DIALOG') {
                    isDialog = true;
                }
                if ($(item).attr('name') === 'deleteTagNode') {
                    isDialog = true;
                }
            });
            if (!inTable && !inSidenav && !isDialog) {
                $scope.closeInformation();
            }
        }
    );

    $scope.$on("$destroy", function () {
        //清除配置,不然scroll会重复请求
        $document.off('click');
    });

    HttpUtils.get('module/system/list', function (response) {
        $scope.moduleMap = response.data.reduce(function (result, module) {
            result[module.id] = module.name;
            return result;
        }, {})
    });


    $scope.editSystemLogConfig = function () {
        HttpUtils.get('log/system/keep/months', function (response) {
            $scope.months = +response.data;
        });
        $scope.formUrl = 'project/html/log/system-log-config.html' + '?_t=' + window.appversion;
        $scope.toggleForm();
    };

    $scope.saveSystemLogConfig = function (months) {
        HttpUtils.post('log/system/keep/months', {paramValue: months}, function (response) {
            $scope.toggleForm();
            Notification.success('日志保存策略设置成功');
        });

    };

    $scope.list = function (sortObj) {
        var condition = FilterSearch.convert($scope.filters);
        if (sortObj) {
            $scope.sort = sortObj;
        }
        if ($scope.sort) {
            condition.sort = $scope.sort.sql;
        }
        HttpUtils.paging($scope, 'log/system', condition)

    };

    $scope.list();
});


