ProjectApp.controller('MailController', function ($scope, $http, Notification, eyeService, HttpUtils) {
    $scope.isSave = false;

    $scope.clickSave = function () {
        $scope.isSave = !$scope.isSave;
        $scope.params = angular.copy($scope.params2);
    };

    $scope.edit = function () {
        $scope.isSave = !$scope.isSave;
    };

    $scope.uiInfo = function () {
        $scope.mail = {
            port: "smtp.port",
            account: "smtp.account",
            password: "smtp.password",
            server: "smtp.server",
            ssl: "smtp.ssl",
            tls: "smtp.tls"
        };

        $scope.loadingLayer = HttpUtils.get("system/parameter/mail/info", function (rep) {
            $scope.params = rep.data;
            $scope.params2 = angular.copy(rep.data);
        });
    };
    $scope.uiInfo();


    $scope.submit = function (data) {
        $scope.loadingLayer = HttpUtils.post("system/parameter/mail/info", data, function () {
            Notification.success("编辑成功!");
            $scope.uiInfo();
            $scope.clickSave();
        });
    };

    $scope.passwordInputLength = function () {
        let length = "100%";
        if ($scope.isSave) {
            length = "98%";
        }
        return {"width": length}
    };

    $scope.addressInputMargin = function () {
        let length = "0px";
        if ($scope.isSave) {
            length = "25px";
        }
        return {"margin-top": length}
    };

    $scope.view = function () {
        eyeService.view("#password", "#eye");
    };

    $scope.transform = function (value) {
        return value === 'true';
    };

    $scope.connectionEnable = true;
    $scope.testConnection = function () {
        $scope.connectionEnable = false;
        let data = {};
        angular.forEach($scope.params, function (param) {
            data[param.paramKey] = param.paramValue;
        });

        $scope.loadingLayer = HttpUtils.post("system/parameter/mail/testConnection", data, function () {
            Notification.success("连接成功");
            $scope.connectionEnable = true;
        }, function (rep) {
            Notification.danger("连接失败: " + rep.message);
            $scope.connectionEnable = true;
        })
    }
});