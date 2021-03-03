ProjectApp.controller('UserController', function ($scope, HttpUtils, FilterSearch, $http, Notification, operationArr, eyeService, $state, $stateParams, ProhibitPrompts, UserService, AuthService, Loading) {

        // 定义搜索条件
        $scope.conditions = [
            {key: "uid", name: "用户名", directive: "filter-contains"},
            {key: "cn", name: "姓名", directive: "filter-contains"},
            {key: "mobile", name: "手机号码", directive: "filter-contains"},
            {key: "mail", name: "邮箱", directive: "filter-contains"},
            {key: "employeeNumber", name: "工号", directive: "filter-contains"},
        ];

        if ($scope.currentRole === $scope.roleConst.admin) {
            $scope.conditions.push({
                key: "organizationId",
                name: "组织",
                directive: "filter-select-virtual",
                url: "organization/listAllOrganizations",
                search: true,
                convert: {value: "id", label: "name"}
            })
        }

        $scope.columns = [
            {value: "用户名", key: "uid"},
            {value: "姓名", key: "cn"},
            {value: "手机号码", key: "mobile"},
            {value: "邮箱", key: "mail"},
            {value: "工号" , key: "employeeNumber"},
            {value: "组织" , key: "organization" ,sort:false},
            {value: "所属用户组" , key: "memberOfGroup" ,sort:false},
            {value: "所属应用" , key : "memberofApp" , sort :false},
            {value: "创建人" , key: "createPeople"}
        ];


        if (AuthService.hasPermissions("USER:READ+EDIT,USER:READ+DELETE,USER:READ+RESET_PASSWORD,USER:READ+LOG")) {
            $scope.columns.push({value: "", default: true, sort: false});
        }


        // 用于传入后台的参数
        $scope.filters = [];

        $scope.list = function (sortObj) {
            const condition = FilterSearch.convert($scope.filters);
            if (sortObj) {
                $scope.sort = sortObj;
            }
            // 保留排序条件，用于分页
            if ($scope.sort) {
                condition.sort = $scope.sort.sql;
            }
            HttpUtils.paging($scope, "user/user/listAllUsers", condition, function () {
                console.log($scope.items);
            });
        };

        $scope.list();


        $scope.create = function () {
            $scope.item = {};
            $scope.item.type = "CREATE";
            $scope.formUrl = 'project/html/user/user/user-edit.html' + '?_t=' + Math.random();
            $scope.toggleForm();
            $scope.show = true;
        };


        $scope.closeToggleForm = function () {
            $scope.item = {};
            $scope.toggleForm();
        };


        $scope.changeType = function (id) {
            ProhibitPrompts.changeType(id);
        };


        $scope.view = function (password, eye) {
            eyeService.view("#" + password, "#" + eye);
        };


        $scope.generateMailAndMobile = function (uid) {
            if (uid) {
                $scope.item.mail = uid+"@jsnx.net";
                $scope.item.mobile = uid ;
            }else{
                $scope.item.mail = "" ;
                $scope.item.mobile = "" ;
            }
        }


        $scope.addLdapUser = function (item) {
            HttpUtils.post("user/user/addLdapUser" ,item ,function(){
                $scope.toggleForm();
                $scope.list();
            })
        }

        $scope.edit = function (item) {

            HttpUtils.get('user/user/selectSsoLdapGroupUpdateDTOByDn/'+item.dn,function (resp) {
                $scope.item = angular.copy(resp.data);
                $scope.item.type = "UPDATE";
                $scope.formUrl = 'project/html/user/user/user-edit.html' + '?_t=' + Math.random();
                $scope.toggleForm();
                $scope.show = true;
            })
        };

        $scope.updateLdapUser = function (item) {
            HttpUtils.post("user/user/updateLdapUser" ,item ,function(){
                $scope.toggleForm();
                $scope.list();
            })
        }


        $scope.openResetPassword = function (item) {
            $scope.resetItem = {};
            $scope.resetItem.uid = item.uid ;
            $scope.formUrl = 'project/html/user/user/user-reset-password.html' + '?_t=' + Math.random();
            $scope.toggleForm();
            $scope.show = true;
        }



        $scope.resetPassword = function (resetItem) {
            console.log(resetItem);
            HttpUtils.post("user/user/resetLdapUserPassword" ,resetItem ,function(){
                $scope.toggleForm();
                $scope.list();
            })
        }


        $scope.delete = function (item) {
            Notification.confirm("将删除ldap用户：" + item.uid + "，确认删除？", function () {
                HttpUtils.post("user/user/deleteLdapUser" ,item ,function(){
                    $scope.list();
                })
            });

        }


        $scope.showMemberOf = function (item) {
            $scope.userDn = item.dn;
            $scope.formUrl = 'project/html/user/user/user-memberof-group.html' + '?_t=' + Math.random();
            $scope.toggleForm();
            $scope.show = true;
        }

        $scope.selectLdapGroupByOrganizationId = function(){
            HttpUtils.get("user/group/selectLdapGroupByOrganizationId" , function (response) {
                $scope.ldapGroups = response.data;
                console.log($scope.ldapGroups);
            })
        }

        $scope.selectLdapGroupByOrganizationId();


        $scope.sync = function () {
            $scope.loadingLayer = HttpUtils.post("user/user/sync" , {} ,function () {
                $scope.list();
                Notification.success("同步成功！");
            },function (rep) {
                Notification.danger(rep.message);
            })
        }

});

ProjectApp.controller('UserMemberOfGroupController', function ($scope, HttpUtils) {

    $scope.columns = [
        {value: "组织ou" , key: "ou" , sort:false},
        {value: "描述" ,key: "description" , sort:false},
    ];

    $scope.list = function(){
        HttpUtils.paging($scope, "user/user/listSsoLdapGroupByUserDn/" + $scope.userDn, {})
    };

    $scope.list();

});
