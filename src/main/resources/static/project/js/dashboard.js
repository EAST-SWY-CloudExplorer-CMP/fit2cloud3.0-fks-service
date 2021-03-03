ProjectApp.directive("podPieChart", function ($timeout) {
    return {
        restrict: 'E',
        templateUrl: function (element, attr) {
            return (attr.templateUrl || "/management-center/project/html/template/pod-pie.html") + '?_t=' + window.appversion;
        },
        scope: {
            setting: "=",
        },
        link: function ($scope, element) {
            let option = {
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data: ['运行中', '未运行']
                },
                title: {
                    text: $scope.setting.count + '\r\n模块',
                    x: 'center',
                    y: 'center',
                    textStyle: {
                        fontWeight: 'normal',
                        fontSize: 12,
                        color: '#39CCCC'
                    }
                },
                tooltip: {
                    //移动端展示方式
                    trigger: 'item',
                    transitionDuration: 0,
                    confine: true,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#333',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    textStyle: {
                        fontSize: 12,
                        color: '#333'
                    },
                    formatter: function (params) {
                        let html = params.marker;
                        if (params.dataIndex === 0) {
                            html = html + '运行中：' + $scope.setting.rmoduleList.length;
                            html = "<table>" + html;
                            let size = $scope.setting.rmoduleList.length;
                            angular.forEach($scope.setting.rmoduleList, function (module, index) {
                                if (size <= 9) {
                                    html = html + "<tr>";
                                    html = html + "<td>" + module.name + "</td>";
                                    html = html + "</tr>";
                                } else if (size <= 18) {
                                    if (index % 2 === 0) {
                                        html = html + "<tr>";
                                        html = html + "<td>" + module.name + "</td>";
                                    } else {
                                        html = html + "<td><span style='margin-left: 15px'>" + module.name + "</span></td>";
                                        html = html + "</tr>";
                                    }
                                } else {
                                    if (index % 3 === 0) {
                                        html = html + "<tr>";
                                        html = html + "<td>" + module.name + "</td>";
                                    } else if (index % 3 === 1) {
                                        html = html + "<td><span style='margin-left: 15px'>" + module.name + "</span></td>";
                                    } else {
                                        html = html + "<td><span style='margin-left: 15px'>" + module.name + "</span></td>";
                                        html = html + "</tr>";
                                    }
                                }
                            });

                            html = html + "</table>"

                        } else {
                            html = html + '未运行：' + $scope.setting.smoduleList.length;
                            html = "<table>" + html;
                            let size = $scope.setting.smoduleList.length;
                            angular.forEach($scope.setting.smoduleList, function (module, index) {
                                if (size <= 9) {
                                    html = html + "<tr>";
                                    html = html + "<td>" + module.name + "</td>";
                                    html = html + "</tr>";
                                } else if (size <= 18) {
                                    if (index % 2 === 0) {
                                        html = html + "<tr>";
                                        html = html + "<td>" + module.name + "</td>";
                                    } else {
                                        html = html + "<td><span style='margin-left: 15px'>" + module.name + "</span></td>";
                                        html = html + "</tr>";
                                    }
                                } else {
                                    if (index % 3 === 0) {
                                        html = html + "<tr>";
                                        html = html + "<td>" + module.name + "</td>";
                                    } else if (index % 3 === 1) {
                                        html = html + "<td><span style='margin-left: 15px'>" + module.name + "</span></td>";
                                    } else {
                                        html = html + "<td><span style='margin-left: 15px'>" + module.name + "</span></td>";
                                        html = html + "</tr>";
                                    }
                                }
                            });
                            html = html + "</table>"
                        }

                        return html;
                    }
                },

                series: [
                    {
                        type: 'pie',
                        radius: ['45%', '60%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: false
                        },
                        data: [
                            {value: $scope.setting.rmoduleList.length, name: '运行中'},
                            {value: $scope.setting.smoduleList.length, name: '未运行'}
                        ]
                    }
                ]
            };

            $scope.echart = echarts.init(element.find("#es_chart")[0], 'fit2cloud-echarts-theme');
            $scope.echart.on('click', function (params) {
                if ($scope.setting.click) {
                    $scope.setting.click(params);
                }
            });
            $scope.echart.setOption(option);
            $timeout(function () {
                $scope.echart.resize();
                $scope.echart.hideLoading();
            });
        }
    }
});

ProjectApp.directive("mcPodPieChart", function (HttpUtils) {

    return {
        restrict: 'E',
        templateUrl: function (element, attr) {
            return (attr.templateUrl || "/management-center/project/html/template/dashboard-charts.html") + '?_t=' + window.appversion;
        },
        link: function ($scope, element) {
            $scope.loadingLayer = HttpUtils.get('/management-center/sys/stats', function (response) {
                $scope.items = response.data;
                angular.forEach($scope.items, function (item) {
                    item.content = angular.fromJson(item.stats)
                    item.setting = {};
                    item.setting.count = item.content.modules.length;
                    item.setting.rmoduleList = [];
                    item.setting.smoduleList = [];
                    angular.forEach(item.content.modules, function (module) {
                        if (module.status === "running") {
                            item.setting.rmoduleList.push(module);
                        } else {
                            item.setting.smoduleList.push(module);
                        }
                    });
                })
            })
        }
    }

});