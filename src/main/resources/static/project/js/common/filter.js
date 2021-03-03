ProjectApp.filter('userSource', function () {
    return function (input) {
        if (input === 'local') {
            return '本地创建'
        }
        if (input === 'extra') {
            return '第三方'
        }

        return input;
    }
});

ProjectApp.filter('roleType', function () {
    return function (input) {
        if (input === 'System') {
            return '系统'
        }
        if (input === 'Additional') {
            return '自定义'
        }
    }
});


ProjectApp.filter('roleParentType', function () {
    return function (input) {
        if (input === 'ADMIN') {
            return '系统管理员'
        }
        if (input === 'ORGADMIN') {
            return '组织管理员'
        }
        if (input === 'USER') {
            return '工作空间用户'
        }
    }
});

ProjectApp.filter('moduleType', function () {
    return function (input) {
        if (input === 'sso-ldapservice') {
            return '统一用户管理模块'
        }
    }
});

ProjectApp.filter('resourceType', function () {
    return function (input) {
        if (input === 'USER') {
            return '用户'
        }
        if (input === 'WORKSPACE') {
            return '工作空间'
        }
        if (input === 'VIRTUALMACHINE') {
            return '云主机'
        }
        if (input === 'PRODUCT') {
            return '产品'
        }
    }
});

ProjectApp.filter('enabled',function () {
    return function (input){
        if (input === true) {
            return '是'
        }
        if (input === false) {
            return '否'
        }
    }
});

ProjectApp.filter('sslRequired',function(){
    return function(input){
        if (input === 'none') {
            return '无需https'
        }
        if (input === 'external') {
            return '外部请求需要https'
        }
        if (input === 'all') {
            return '所有请求需要https'
        }
    }
});

ProjectApp.filter('deployStatus',function () {
    return function (input){
        if (input === true) {
            return '成功'
        }
        if (input === false) {
            return '失败'
        }
    }
});

