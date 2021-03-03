/**
 * 启动app，加载菜单
 */
let ProjectApp = angular.module('ProjectApp', ['f2c.common', 'f2c.process', 'ngSanitize', 'ui.codemirror', 'ngFileUpload']);

ProjectApp.controller('IndexCtrl', function ($scope) {

    $scope.menus = [
        {
            name: "tag-values-edit",
            url: "/tag/values",
            params: {
                tag: null,
                tagParam: null
            },
            templateUrl: "project/html/tag/tag-value-list.html" + '?_t=' + window.appversion
        }, {
            name: "import-user",
            url: "/import/user",
            templateUrl: "project/html/user/extra-users.html" + '?_t=' + window.appversion
        }
    ];

    console.log($scope.menus);

});

ProjectApp.directive("podLineChart", function ($timeout, HttpUtils) {
    return {
        restrict: 'E',
        templateUrl: function (element, attr) {
            return (attr.templateUrl || "project/html/template/pod-line.html") + '?_t=' + window.appversion;
        },
        scope: {
            setting: "=",
        },
        link: function ($scope, element) {

            let chartGridTop = 20;
            let chartGridHeight = 30;

            function makeGrid(top, height, opt) {
                return echarts.util.merge({
                    left: 100,
                    right: 10,
                    top: top,
                    height: height
                }, opt || {}, true);
            }

            function makeXAxis(gridIndex, xdata, opt) {
                return echarts.util.merge({
                    type: 'category',
                    gridIndex: gridIndex,
                    axisTick: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    //统一时间轴数据
                    data: xdata,
                }, opt || {}, true);
            }

            function makeYAxis(gridIndex, opt) {
                return echarts.util.merge({
                    type: 'value',
                    nameLocation: 'middle',
                    nameGap: '20',
                    nameRotate: 0,
                    gridIndex: gridIndex,

                    nameTextStyle: {
                        color: '#333'
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    },
                    splitLine: {
                        show: false
                    },

                }, opt || {}, true);
            }

            function makeGridData(xAxisIndex, yAxisIndex, chartType, chartName, chartData, opt) {
                return echarts.util.merge({
                    type: chartType,
                    name: chartName,
                    xAxisIndex: xAxisIndex,
                    yAxisIndex: yAxisIndex,
                    data: chartData,
                    areaStyle: {normal: {}},
                    symbol: 'none'
                }, opt || {}, true);
            }

            let option = {

                tooltip: {
                    //移动端展示方式
                    trigger: 'axis',
                    transitionDuration: 0,
                    confine: true,
                    bordeRadius: 4,
                    borderWidth: 1,
                    borderColor: '#333',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    textStyle: {
                        fontSize: 12,
                        color: '#333'
                    },
                    formatter: function (params, ticket, callback) {
                        params.sort(compare("axisIndex"));
                        let html = '';
                        params.forEach(function (param) {
                            html += param.axisValueLabel + '<br/>' + param.marker + param.seriesName + ":" + param.value + "%<br>"
                        });

                        return html;
                    }
                },
                //坐标轴指示器（axisPointer）的全局公用设置
                axisPointer: {
                    type: 'shadow',
                    link: {
                        xAxisIndex: 'all'
                    }
                },
                //直角坐标系内绘图网格
                grid: [
                    makeGrid(chartGridTop, chartGridHeight),
                    makeGrid(chartGridTop + (chartGridHeight + 25), chartGridHeight),
                    makeGrid(chartGridTop + (chartGridHeight + 25) * 2, chartGridHeight),
                ],
                xAxis: [],
                yAxis: [
                    makeYAxis(0, {
                        name: 'CPU',
                        min: 0,
                        max: 100
                    }),
                    makeYAxis(1, {
                        name: '内存',
                        max: 100
                    }),
                    makeYAxis(2, {
                        name: '磁盘',
                        max: 100
                    }),
                ],
                //每个系列通过 type 决定自己的图表类型
                series: []
            };


            HttpUtils.get('sys/metric/' + $scope.setting.resourceId, function (response) {
                let data = response.data;
                time(data);
                option.xAxis.push(makeXAxis(0, data[0].time));
                option.xAxis.push(makeXAxis(1, data[1].time));
                option.xAxis.push(makeXAxis(2, data[2].time));

                option.series.push(makeGridData(0, 0, 'line', 'CPU使用率', data[0].values));
                option.yAxis[0].name = 'CPU \n' + data[0].values[data[0].values.length - 1] + "%";

                option.series.push(makeGridData(1, 1, 'line', '内存使用率', data[1].values));
                option.yAxis[1].name = '内存 \r\n' + data[1].values[data[1].values.length - 1] + "%";

                option.series.push(makeGridData(2, 2, 'line', '磁盘使用率', data[2].values));
                option.yAxis[2].name = '磁盘 \n' + data[2].values[data[2].values.length - 1] + "%";
                $scope.echart = echarts.init(element.find("#es_chart")[0], 'fit2cloud-echarts-theme');


                $scope.echart.setOption(option);
                $scope.echart.getZr().on('click', function () {
                    if ($scope.setting.click) {
                        $scope.setting.click($scope.setting.resourceId);
                    }
                });
            });

            function time(data) {

                angular.forEach(data, function (item) {
                    item.time = [];
                    angular.forEach(item.timestamps, function (timestamp, index) {
                        item.time.push(moment(+timestamp).format("HH:mm"))
                        item.values[index] = item.values[index].toFixed(2);
                    });
                });
            }

            let compare = function (prop) {
                return function (obj1, obj2) {
                    var val1 = obj1[prop];
                    var val2 = obj2[prop];
                    if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
                        val1 = Number(val1);
                        val2 = Number(val2);
                    }
                    if (val1 < val2) {
                        return -1;
                    } else if (val1 > val2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        }
    }
});

ProjectApp.filter("toTrusted", ['$sce', function ($sce) {
    return function (text) {
        if (text) {
            return $sce.trustAs($sce.HTML, text);
        } else {
            return null;
        }
    }
}]);