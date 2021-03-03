ProjectApp.controller('KoParamController', function ($scope, Notification, eyeService, HttpUtils) {
    $scope.isSave = false;

    $scope.clickSave = function () {
        $scope.isSave = !$scope.isSave;
        let passwordElement = angular.element("#password");
        let eyeElement = angular.element("#eye");
        passwordElement[0].type = 'password';
        eyeElement.addClass("fa fa-eye");
        $scope.params = angular.copy($scope.params2)
    };

    $scope.koInfo = function () {
        $scope.username = "ko.username";
        $scope.password = "ko.password";
        $scope.address = "ko-server-address";

        $scope.loadingLayer = HttpUtils.get("ko/settings", function (response) {
            $scope.params = response.data;
            console.log('$scope.params' + $scope.params);
            $scope.params2 = angular.copy(response.data);
        });
    };
    $scope.koInfo();

    $scope.view = function () {
        eyeService.view("#password", "#eye");
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
            length = "42px";
        }
        return {"margin-top": length}
    };

    $scope.jump2KeyCloak = function (url) {
        window.open(url);
    };

    $scope.submit = function (data) {
        $scope.loadingLayer = HttpUtils.post("ko/settings", data, function () {
            Notification.success("编辑成功!");
            $scope.koInfo();
            $scope.clickSave();
        });
    };
});