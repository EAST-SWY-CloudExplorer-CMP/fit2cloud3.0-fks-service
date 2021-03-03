ProjectApp.controller('CloudResourceMetricController', function ($scope) {
    $scope.buildQueries = function () {
        var metrics = $scope.metrics ? $scope.metrics : [];
        var metricQueries = [];
        for (var i = 0; i < metrics.length; i++) {
            metricQueries.push({
                resourceId: $scope.detail.id,
                resourceName: $scope.detail.name,
                metricSource: "API",
                metric: metrics[i]
            });
        }
        return metricQueries;
    };

    $scope.request = {
        metricDataQueries: $scope.buildQueries()
    };

    $scope.url = "sys/metric/query";

    $scope.execute = function () {
        $scope.request.metricDataQueries = $scope.buildQueries();
        if ($scope.request.execute) {
            $scope.request.execute();
        }
    };

    $scope.$on('showDetail', $scope.execute);
});

