ProjectApp.controller('SpecsController', function ($scope, $mdDialog, $state, HttpUtils, FilterSearch, Notification, $http ) {
    //列表列
    $scope.columns = [
        {value: "规格名称", key: "specsName", sort: false},// 不想排序的列，用sort: false
        {value: "节点数量", key: "nodeNum", sort: false},
        {value: "可用区", key: "zone", sort: false},
        {value: "部署模型", key: "deployType", sort: false},
        {value: "创建时间", key: "createTime", sort: false}
    ];

    $scope.specsItems = [];

    $scope.deployTypes = [
        {id: "1", name: "一主多节点"},
        {id: "2", name: "多主多节点"}
    ];

    // 全选按钮，添加到$scope.columns
    $scope.first = {
        default: true,
        sort: false,
        type: "checkbox",
        checkValue: false,
        change: function (checked) {
            $scope.specsItems.forEach(function (item) {
                item.enable = checked;
            });
        },
        width: "40px"
    };
    $scope.columns.unshift($scope.first);

    $scope.createSpecs = function () {
        // $scope.noroot = {
        //     onChange: function (node) {
        //         $scope.onChangeTree(node);
        //     }
        // };
        // $scope.item = {};
        // $scope.item.systemType = 'add';
        $scope.formUrl = 'project/html/specs/specs-add.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    };

    $scope.getSpecsList = function () {
        HttpUtils.post("ko/querySpecs", null, function (response) {
            $scope.specsItems = angular.copy(response.data);
        });
    };
    $scope.getSpecsList();

    $scope.saveSpecs = function (specsItem) {
        if (!specsItem.name || !specsItem.nodeNum || !specsItem.zone || !specsItem.deployType) {
            return;
        }

        var success = 0;
        var saveSpecsReq = {};
        saveSpecsReq.specsName = specsItem.name;
        saveSpecsReq.nodeNum = specsItem.nodeNum;
        saveSpecsReq.zone = specsItem.zone;
        saveSpecsReq.deployType = specsItem.deployType;

        HttpUtils.post("ko/saveSpecs", saveSpecsReq, function (response) {
            console.log("save success :" + response.data);
            success++;
        });
        Notification.info("保存成功");
        $state.reload();
        //$scope.formUrl = 'project/html/specs/specs-list.html' + '?_t=' + Math.random();
    };

    $scope.deleteSpecs = function () {
        var success = 0;
        $scope.noChoose = true;
        angular.forEach($scope.specsItems, function (c) {
            if (c.enable) {
                $scope.noChoose = false;
            }
        });
        if ($scope.noChoose) {
            Notification.info("未选择操作项");
            return;
        }

        angular.forEach($scope.specsItems, function (s) {
            var deleteReq = {};
            if (s.enable) {
                deleteReq.specsId = s.specsId;
                HttpUtils.post("ko/deleteSpecs", deleteReq, function (response) {
                    console.log("delete success :" + response.data);
                    success++;
                });
            }
        });
        $state.reload();
        //$scope.formUrl = 'project/html/specs/specs-list.html' + '?_t=' + Math.random();
    };

    $scope.closeToggleForm = function () {
        $scope.toggleForm();
    };
});