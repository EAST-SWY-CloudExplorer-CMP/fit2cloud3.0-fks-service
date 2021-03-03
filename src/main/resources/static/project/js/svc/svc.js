ProjectApp.controller('HostGridController', function ($scope, HttpUtils, FilterSearch, $http, Notification, operationArr, eyeService, $state, $stateParams, ProhibitPrompts, UserService, AuthService, Loading) {
    $scope.columnsHostGrid = [
        {value: "名称", key: "name"},
        {value: "状态", key: "status"},
        {value: "主机类型", key: "type"},
        {value: "端口数", key: "portCount"},
        {value: "主机映射" , key: "isMapped"}
    ];

    $scope.listHostGrid = function () {
        $scope.loadingLayer = HttpUtils.get("fks/listHostGrid", function (resp) {
            $scope.items = angular.copy(resp.data);
            console.log($scope.items);
        });
    };

    $scope.listHostGrid();
});

ProjectApp.controller('VDiskGridController', function ($scope, HttpUtils, FilterSearch, $http, Notification, operationArr, eyeService, $state, $stateParams, ProhibitPrompts, UserService, AuthService, Loading) {
    $scope.columns = [
        {value: "名称", key: "name"},
        {value: "状态", key: "status"},
        {value: "池", key: "mdiskGrpName"},
        {value: "唯一标识", key: "vdiskUid"},
        {value: "主机映射" , key: "isMapped"},
        {value: "容量" , key: "capacity"}
    ];

    $scope.list = function () {
        $scope.loadingLayer = HttpUtils.get("fks/listVDiskGrid", function (resp) {
            $scope.items = angular.copy(resp.data);
            console.log($scope.items);
        });
    };

    $scope.list();
});

ProjectApp.controller('HostVDiskMappingGridController', function ($scope, HttpUtils, FilterSearch, $http, Notification, operationArr, eyeService, $state, $stateParams, ProhibitPrompts, UserService, AuthService, Loading) {
    $scope.columns = [
        {value: "主机名", key: "name"},
        {value: "SCSI标识", key: "scsiId"},
        {value: "卷名", key: "vdiskName"},
        {value: "卷唯一标识", key: "vdiskUid"},
        {value: "高速缓存I/O组标识" , key: "ioGroupName"}
    ];

    $scope.list = function () {
        $scope.loadingLayer = HttpUtils.get("fks/listHostVDiskMappingGrid", function (resp) {
            $scope.items = angular.copy(resp.data);
            console.log($scope.items);
        });
    };

    $scope.list();
});

ProjectApp.controller('FlashCopyTreeController', function ($scope, HttpUtils, FilterSearch, $http, Notification, operationArr, eyeService, $state, $stateParams, ProhibitPrompts, UserService, AuthService, Loading) {
    $scope.columns = [
        {value: "卷名", key: "name"},
        {value: "状态", key: "status"},
        {value: "进度", key: "progress"},
        {value: "容量", key: "capacity"},
        {value: "组" , key: "groupName"},
        {value: "闪存时间" , key: "startTime"}
    ];

    $scope.list = function () {
        $scope.loadingLayer = HttpUtils.get("fks/listFlashCopyTree", function (resp) {
            $scope.items = angular.copy(resp.data);
            console.log($scope.items);
        });
    };

    $scope.list();
});

ProjectApp.controller('EventLogGridController', function ($scope, HttpUtils, FilterSearch, $http, Notification, operationArr, eyeService, $state, $stateParams, ProhibitPrompts, UserService, AuthService, Loading) {
    $scope.columns = [
        {value: "错误代码", key: "errorCode"},
        {value: "最后一个时间戳记", key: "lastTimestampFormatted"},
        {value: "状态", key: "status"},
        {value: "描述", key: "description"},
        {value: "对象类型" , key: "objectType"},
        {value: "对象标识" , key: "objectId"},
        {value: "对象名" , key: "objectName"},
        {value: "报告节点名称" , key: "reportingNodeName"},
        {value: "事件计数" , key: "eventCount"}
    ];

    $scope.list = function () {
        $scope.loadingLayer = HttpUtils.get("fks/listEventLogGrid", function (resp) {
            $scope.items = angular.copy(resp.data);
            console.log($scope.items);
        });
    };

    $scope.list();
});
