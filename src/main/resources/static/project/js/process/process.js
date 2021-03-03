ProjectApp.controller('ProcessController', function ($scope, $mdDialog, HttpUtils, FilterSearch, Notification, $http ) {
    //列表列
    $scope.columns = [
        {value: "模型编号", key: "modelId", sort: false},// 不想排序的列，用sort: false
        {value: "模型名称", key: "modelName", sort: false},
        {value: "模型版本", key: "modelVersion", sort: false},
        {value: "修改时间", key: "updateTime", sort: false},
        {value: "是否发布", key: "isPublish", sort: false}
    ];

    $scope.create = function () {
        $scope.noroot = {
            onChange: function (node) {
                $scope.onChangeTree(node);
            }
        };
        $scope.item = {};
        $scope.item.systemType = 'add';
        $scope.formUrl = 'project/html/process/process-add.html' + '?_t=' + Math.random();
        $scope.toggleForm();
        $scope.show = true;
    };
});