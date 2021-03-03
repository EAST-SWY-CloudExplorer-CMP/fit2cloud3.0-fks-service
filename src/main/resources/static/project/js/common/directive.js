ProjectApp.directive('passwordCheck', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attributes, ctrl) {
            ctrl.$validators.passwordCheck = function (modelValue) {
                let passwordCheck = attributes.passwordCheck;
                let split = passwordCheck.split('.');
                let password = null;
                if (split.length === 1) {
                    password = scope[passwordCheck];
                } else {
                    let v = scope;
                    angular.forEach(split, function (data) {
                        if (angular.isUndefined(v[data])) {
                            return false;
                        } else {
                            v = v[data]
                        }
                    });
                    password = v;
                }
                return password === modelValue;
            };
        }
    };
});

ProjectApp.directive('colorPicker', function ($timeout) {
    return {
        priority: 0,
        require: '?ngModel',
        scope: {
            modelValue: '=ngModel'
        },
        link: function ($scope, element, attributes, ngModel) {

            let defaults = {
                control: 'hue',
                format: 'hex',
                keywords: '',
                inline: false,
                letterCase: 'uppercase',
                position: 'bottom left',
                swatches: [],
                change: function (hex, opacity) {
                    return hex
                },
                theme: 'default'
            };

            function isValidColor(color) {
                return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
            }

            ngModel.$render = function () {
                $timeout(function () {
                    let color = ngModel.$viewValue;
                    setMinicolorsValue(color);
                }, 0, false);
            };

            function setMinicolorsValue(color) {
                if (isValidColor(color)) {
                    element.minicolors('value', color);
                } else {
                    element.minicolors('value', '');
                }
            }

            if (element.hasClass('minicolors-input')) {
                element.minicolors('destroy');
                element.off('blur', onBlur);
            }

            element.minicolors(defaults);

            element.on('blur', onBlur);

            function onBlur(e) {
                $scope.$apply(function() {
                    let color = element.minicolors('value');
                    if (isValidColor(color))
                        ngModel.$setViewValue(color);
                });
            }
        }
    };
});

ProjectApp.directive("clusterInfo", function (HttpUtils, $window) {
    return {
        restrict: 'E',
        template: '<span ng-if="cluster.icon"><img ng-src="{{cluster.icon}}" width="16px" height="16px" style="vertical-align:middle" />&nbsp;{{cluster.accountName}} ' +
            '<md-tooltip md-delay="300" md-direction="right" class="f2c-tooltip-user" ng-if="cluster.webConsole">{{cluster.webConsole}}</md-tooltip>' +
            '<a class="md-primary" style="cursor: pointer;text-decoration: none;" href="{{cluster.webConsole}}" target="_blank"  ng-if="cluster.webConsole">\n' +
            '                                    <i class="material-icons md-primary" style="vertical-align: middle;font-size: 16px;height: 16px;width: 16px;">\n' +
            '                                        open_in_new\n' +
            '                                    </i>\n' +
            '                                </a><span ng-if="cluster.accountStatus === \'INVALID\'" style="color: red">(无效)</span></span><span ng-if="!cluster.icon">未知</span>',
        scope: {
            id: "="
        },
        link: function ($scope) {
            if (!$window.parent.clusterInfoMap) {
                $window.parent.clusterInfoMap = {};
            }

            if ($window.parent.clusterInfoMap[$scope.id]) {
                $scope.cluster = $window.parent.clusterInfoMap[$scope.id];
            } else {
                HttpUtils.get('condition/' + $scope.id + '/cloud/account', function (response) {
                    $scope.cluster = response.data;
                    $window.parent.clusterInfoMap[$scope.id] = $scope.cluster;
                });
            }

        }
    }
});

ProjectApp.directive("dashboardPieChart", function (HttpUtils, Notification, $timeout) {
    return {
        replace: true,
        templateUrl: 'project/html/dashboard/dashboard-pie-chart.html' + '?_t=' + window.appversion,
        scope: {
            setting: "=",
            loading: "=?",
        },
        link: function ($scope, element) {
            $scope.echart = echarts.init(element.find('#echart_box')[0], 'fit2cloud-echarts-theme');
            let size = ['35%', '50%'], center = ['50%', '60%'];
            let position = 'inner';
            if ($scope.setting.label && $scope.setting.label.position) {
                position = $scope.setting.label.position;
            }

            let option = {
                backgroundColor: '#fff',
                tooltip: {
                    trigger: 'item',
                    formatter: "{b} : {c} ({d}%)"
                },
                toolbox: {
                    show: false
                },
                legend: {
                    data: []
                },
                series: [
                    {
                        label: {
                            normal: {
                                position: position,
                                formatter: '{c}'
                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '12',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                        type: 'pie',
                        radius: size,
                        center: center,
                        startAngle: 0,
                        data: [],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            if ($scope.setting.unit) {
                option.series[0].label.normal.formatter = '{c} ' + $scope.setting.unit;
                option.tooltip.formatter = '{b} : {c} ' + $scope.setting.unit + ' ({d}%)';
            }
            $scope.showLoading = function () {
                $scope.echart.showLoading({
                        text: '',
                        color: '#2B415A',
                        textColor: '#000',
                        maskColor: 'rgba(255, 255, 255, 0.8)',
                        zlevel: 5
                    }
                );
            };
            $scope.setting.execute = function () {
                $timeout(function () {
                    $scope.echart.resize();
                    $scope.showLoading();
                });
                $scope.noData = false;
                return HttpUtils.post($scope.setting.url, $scope.setting.param || {}, function (response) {
                    let legend = [];
                    let data = [];
                    let pieChartData = response.data;
                    if (!pieChartData || pieChartData.length === 0) {
                        $scope.noData = true;
                    }
                    pieChartData.forEach(function (item) {
                        let name = item.groupName || '其他';
                        if ($.inArray(name, legend) === -1) {
                            legend.push(name);
                            data.push({value: item.yAxis, name: name, customId: item.customId});
                        } else {
                            for (let i = 0; i < data.length; i++) {
                                if (data[i].name === name) {
                                    data[i].value = parseFloat(data[i].value) + item.yAxis;
                                    data[i].value = data[i].value;
                                }
                            }
                        }
                    });
                    $scope.echart.clear();
                    option.legend.data = legend;
                    option.series[0].data = data;
                    // 如果group name 太少 缩小饼图的高度
                    if ($scope.setting.size === 'large' && data.length < 8) {
                        option.series[0].center = ['50%', '50%'];
                    }
                    $scope.echart.setOption(option);
                    $timeout(function () {
                        $scope.echart.resize();
                        $scope.echart.hideLoading();
                    });
                }, function (response) {
                    Notification.danger(response.data ? response.data.message ? response.data.message : response.message : response.message);
                    $timeout(function () {
                        $scope.echart.resize();
                        $scope.echart.hideLoading();
                    });
                });
            };
            $scope.loading = $scope.setting.execute();
        }
    };
});