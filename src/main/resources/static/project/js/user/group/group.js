ProjectApp.controller('GroupController', function ($scope, HttpUtils, FilterSearch, $http, Notification, operationArr, eyeService, $state, $stateParams, ProhibitPrompts, UserService, AuthService, Loading) {

        // 定义搜索条件
        $scope.conditions = [
            {key: "ou", name: "部门名称", directive: "filter-contains"},
            {key: "description", name: "描述", directive: "filter-contains"},
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
            {value: "用户组名称", key: "slg.ou"},
            {value: "描述", key: "slg.description"},
            {value: "所属组织" , key: "organizations" , sort:false},
            {value: "成员" ,key: "userCount" , sort:false},
            {value: "创建人", key: "slg.create_people"},
        ];

        $scope.parentGroupDn=[];
        HttpUtils.get('system/parameter/getParameterValue/ldap.server.groupDn' ,function (resp) {
            $scope.parentGroupDn.push(resp.data);
        })

        $scope.isOrgAdmin = UserService.isOrgAdmin();



    if (AuthService.hasPermissions("USER:READ+EDIT,USER:READ+DELETE,USER:READ+RESET_PASSWORD,USER:READ+LOG")) {
            $scope.columns.push({value: "", default: true, sort: false});
        }


        $scope.listAllUsers = function () {
            HttpUtils.get("user/user/listAllUsers" , function(response){
                $scope.ldapUsers = response.data;
            })
        }


        $scope.listAllUsers();

        // 用于传入后台的参数
        $scope.filters = [];


        $scope.getSsoLdapGroupParentDns = function(condition){
            HttpUtils.post( "user/group/getSsoLdapGroupParentDns", condition, function (response) {
                $scope.parentLdapDns = response.data;
                console.log($scope.parentLdapDns);
            });
        }

        $scope.list = function (sortObj) {

            console.log($scope.parentGroupDn);

            const condition = FilterSearch.convert($scope.filters);

            if (sortObj) {
                $scope.sort = sortObj;
            }
            // 保留排序条件，用于分页
            if ($scope.sort) {
                condition.sort = $scope.sort.sql;
            }

            if ($scope.parentGroupDn.length > 0) {
                condition.parentDns = $scope.parentGroupDn;
            }

            HttpUtils.paging($scope, "user/group/listSsoLdapGroup", condition, function () {
                console.log($scope.items);
            });

            //获取dn所有上级条目
            $scope.getSsoLdapGroupParentDns(condition);
        };

        setTimeout(function () {
            $scope.list();
        },300)



        $scope.listInner = function(groupDn){

            const condition = FilterSearch.convert($scope.filters);

            // 保留排序条件，用于分页
            if ($scope.sort) {
                condition.sort = $scope.sort.sql;
            }

            condition.parentDns = [] ;
            condition.parentDns.push(groupDn);

            $scope.parentGroupDn = condition.parentDns;

            console.log(condition);

            HttpUtils.paging($scope, "user/group/listSsoLdapGroup", condition, function () {
                console.log($scope.items);
            });

            //获取dn所有上级条目
            $scope.getSsoLdapGroupParentDns(condition);
        }


        $scope.acquisitionConditions = function () {
            if ($scope.currentRole === $scope.roleConst.orgAdmin) {
                HttpUtils.get("organization/currentOrganizations", function (rep) {
                    $scope.orgs = rep.data;
                });
            } else {
                HttpUtils.get("organization/listAllOrganizations", function (rep) {
                    $scope.orgs = rep.data;
                });
            }
        };

        $scope.acquisitionConditions();

        $scope.create = function () {
            $scope.item = {};
            $scope.formUrl = 'project/html/user/group/group-add.html' + '?_t=' + Math.random();
            $scope.toggleForm();
            $scope.show = true;
        };


        $scope.closeToggleForm = function () {
            $scope.item = {};
            $scope.toggleForm();
        };

        $scope.addLdapGroup = function (item) {
            item.baseDn = $scope.parentLdapDns[$scope.parentLdapDns.length-1];
            console.log(item);

            HttpUtils.post("user/group/addSsoLdapGroup" ,item ,function(){
                $scope.toggleForm();
                $scope.list();
            })
        }

        $scope.edit = function (item) {

            HttpUtils.get("user/group/selectLdapGroupUpdateDtoByDn/"+item.dn, function(response){
                $scope.editItem = response.data;

                console.log($scope.editItem);
                $scope.formUrl = 'project/html/user/group/group-update.html' + '?_t=' + Math.random();
                $scope.toggleForm();
                $scope.show = true;
            })
        };

        $scope.updateLdapGroup = function (edititem) {
            HttpUtils.post("user/group/modifyLdapGroup" ,edititem ,function(){
                $scope.toggleForm();
                $scope.list();
            })
        }


        $scope.delete = function (item) {
            console.log(item);

            HttpUtils.get("user/group/selectLdapUserByGroupDn/"+item.dn , function (response) {
                $scope.members = response.data;
                $scope.memberNames = "" ;
                if ($scope.members) {
                    angular.forEach($scope.members , function (member) {
                        $scope.memberNames =$scope.memberNames + member.cn + "，"
                    })
                    $scope.memberNames = $scope.memberNames.substr(0 , $scope.memberNames.length-1);
                }
                Notification.confirm("将删除ldap用户组：" + item.ou + "，该用户组下有下列用户，"+$scope.memberNames+"，确认删除？", function () {
                    HttpUtils.post("user/group/deleteLdapGroup" ,item ,function(){
                        $scope.list();
                    })
                });
            })
        }


        $scope.showMembers = function(item){

            $scope.groupDn = item.dn;
            $scope.formUrl = 'project/html/user/group/group-members.html' + '?_t=' + Math.random();
            $scope.toggleForm();
            $scope.show = true;


        }


        $scope.sync = function () {
            $scope.loadingLayer = HttpUtils.post("user/group/sync" , {} , function () {
                $scope.list();
                Notification.success("同步成功！");
            } , function (resp) {
                Notification.danger(resp.message);
            })
        }

});

ProjectApp.controller('GroupMembersController', function ($scope, HttpUtils) {

    $scope.columns = [
        {value: "用户名" , key: "uid" , sort:false},
        {value: "姓名" ,key: "cn" , sort:false},
        {value: "邮箱" ,key: "mail" , sort:false},
    ];

    $scope.list = function(){
        HttpUtils.paging($scope, "user/group/selectLdapUserByGroupDn/" + $scope.groupDn, {})
    };

    $scope.list();

});