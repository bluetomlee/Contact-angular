'use strict';
// epdApp
var contact_module = angular.module('epdApp.contacts', ['ngRoute', 'ui.bootstrap', 'cgPrompt',,'ngAnimate','ui.select2','angular.city.select'])
    .controller('ContactsController', ['$scope', '$http', '$rootScope', '$timeout','$modal','notify','prompt',
        function($scope, $http, $rootScope, $timeout,$modal,notify,prompt) {

            // 显示指定字段
            $scope.shownPropertyTitle = "";
            $scope.userProperty = function (){
                var url = '/japi/teammeta/get?name=U_PROPERTY_CONFIG',
                    arr = [];
                $http.get(url).success(function(data){
                    $scope.propertyItems = $.parseJSON(data.value);
                    for (var i = 0 ;i < $scope.propertyItems.length; i++) {
                        if($scope.propertyItems[i].shown){
                            arr.push($scope.propertyItems[i]);
                            if($scope.propertyItems[i].key == 'publicAvatarPath'){
                                $scope.isShowUserAvatar = true;
                            }
                        }
                    };
                    $scope.shownPropertyTitle = arr;
                });

                
                
            };

            // $scope.filterProperty = function (code) {
            //     return function (contact) {
            //         return contact[] === 
            //     }
            // }
            $scope.nodeChangedDepart = function(newNode) {
                // do something when node changed
                // console.log('update ' + newNode.subid);
                // 双向绑定数据更新
                /*
                var size = 10;

                if(newNode.subid == 0) {
                    size = 30;
                }
                */
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                    console.log('Page changed to: ' + $scope.currentPage);
                    refreshContacts($scope.currentPage, $scope.maxSize);
                };
                var setPagination = $scope.setPagination = function(totalItems, currentPage, size) {
                    // console.info
                    $scope.totalItems = totalItems; // Math.ceil(totalItems/size);
                    $scope.currentPage = currentPage;
                    $scope.maxSize = size;
                    console.log($scope.totalItems, currentPage, size)
                };
                var refreshContacts = $scope.refreshContacts = function(page, size, num){
                    // 拼装GET链接
                    var dataUrl = '/japi/qiye/contact/list/bydeparment?id=' + newNode.subid + "&size="+ size +"&page=" + page;
                    if(num >= 0){
                        dataUrl = '/japi/qiye/contact/list/bydeparment?id=' + newNode.subid + "&size="+ size +"&page=" + page +"&status=" + num;
                    }
                    if(newNode.subid == 999999){
                        dataUrl = '/japi/qiye/contact/blacklist';
                    }
                    $http.get(dataUrl).success(function(data) {
                        $scope.contacts = data.items;
                        $scope.contactTotal = data.pageBean.count;
                        // console.info(11,$scope.contacts);
                         // 设置分页
                        setPagination(data.pageBean.count, data.pageBean.current, size);
                    });
                }
            //初始化
            var init = function() {
                refreshContacts(1, 100);
                $scope.tagsList();
            };

            $timeout(function() {
                init();
            });

            };


            /*成员状态 下拉列表*/
            $scope.status = {
                isopen: false
            };
            $scope.toggleDropdown = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };


            /*根据标签获取人数*/
            $scope.nodeChangedTag = function(newNode) {
                // do something when node changed
                // console.log('update ' + newNode.subid);
                // 双向绑定数据更新
                /*
                 var size = 10;

                 if(newNode.subid == 0) {
                 size = 30;
                 }
                 */
                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };
                $scope.pageChanged = function() {
                    console.log('Page changed to: ' + $scope.currentPage);
                    refreshContacts($scope.currentPage, $scope.maxSize);
                };
                var setPagination = $scope.setPagination = function(totalItems, currentPage, size) {
                    // console.info
                    $scope.totalItems = totalItems; // Math.ceil(totalItems/size);
                    $scope.currentPage = currentPage;
                    $scope.maxSize = size;
                    console.log($scope.totalItems, currentPage, size)
                };
                var refreshContacts = $scope.refreshContacts = function(page, size, num){
                    // 拼装GET链接
                    var dataUrl = '/japi/qiye/contact/list/bytag?id=' + newNode.subid + "&size="+ size +"&page=" + page;
                    if(num >= 0){
                        dataUrl = '/japi/qiye/contact/list/bytag?id=' + newNode.subid + "&size="+ size +"&page=" + page +"&status=" + num;
                    }
                    $http.get(dataUrl).success(function(data) {
                        $scope.contacts = data.items;
                        // console.info(11,$scope.contacts);
                        // 设置分页
                        console.info(data)
                        setPagination(data.pageBean.count, data.pageBean.current, size);
                    });
                }
                //初始化
                var init = function() {
                    refreshContacts(1, 100);
                    $scope.tagsList();
                };

                $timeout(function() {
                    init();
                });

            };


            $scope.remindInfor = function(data){
                if(data.success){
                    notify({
                        message: '操作成功',
                        classes: 'alert-success'
                    })
                }else{
                    notify({
                        message: data.message,
                        classes: 'alert-error'
                    })
                }

            }
            // 初始化的数据难
            // $http.get('/japi/qiye/contact/list/bydeparment?id=0&size=100')
            //    .success(function(data) {
            //        // 为什么会请求两次
            //        // console.info(data.items);
            //        $scope.contacts = data.items;
            //    });
            $scope.search = function(keyword){
                var size = 100,
                    page = 1;
                var dataUrl = '/japi/qiye/contact/list/bydeparment?&size=' + size +"&page=" + page + "&keyword=" + keyword;
                $http.get(dataUrl).success(function(data){
                    $scope.contacts = data.items;
                    $scope.setPagination(data.pageBean.count, data.pageBean.current, size);
                })
            };

            // 标签管理
            $scope.showTags = function(){
                $scope.tagsList();
                $scope.tabStatus=!$scope.tabStatus;
            };

            $scope.epdEditContact = function(contactId, userData) {
                // console.log(contactId);

                // 控制 userData 显示与否
                $scope.userDepartment = null;
                $scope.userinfo = userData;
                $scope.isShowUserInfo = true;
                $scope.isEditInfor = false;
                $scope.userTags(userData);
                $scope.chckUserBlack(userData.id)
                var dpUrl = '/japi/qiye/department/list';
                $http.get(dpUrl).success(function(data){
                    var userDepartments=[];
                    var len = userData.departmentList.length-1;
                    for (var i = 0;i < data.items.length ; i++) {
                        if(len >= 0){
                                if(data.items[i].id == userData.departmentList[len].id){
                                $scope.userDepartment = data.items[i];
                            }
                        }
                        // $scope.departmentTree
                    };
                    $scope.departmentListAll = data.items;
                    $scope.userDepartments = userDepartments;
                    // console.log(userDepartments);
                });

                // 显示
                // $(".panel-box").animate({right:"0"},500);
            };


            // 编辑用户详情

            $scope.editUserinfor = function(){
                $scope.isEditInfor = true;
                $scope.departmentTree();
                $scope.tagAction = false;
            };
            // 部门分级器
            $scope.departmentTree = function(){
                var dpUrl = '/japi/qiye/department/list';
                $http.get(dpUrl).success(function(data){
                    var userDepartments=[];
                    for (var i = 0;i < data.items.length ; i++) {
                        if(data.items[i].level == 1){
                            userDepartments.push(data.items[i])
                            for (var j = 0;j < data.items.length ; j++) {
                                if(data.items[j].parent == data.items[i].id){
                                    userDepartments.push(data.items[j])
                                    for (var t = 0;t < data.items.length ; t++) {
                                        if(data.items[t].parent == data.items[j].id){
                                            userDepartments.push(data.items[t])
                                            for (var v = 0;v < data.items.length ; v++) {
                                                if(data.items[v].parent == data.items[t].id){
                                                    userDepartments.push(data.items[v])
                                                }
                                            };
                                        }
                                    };
                                }
                            };
                        }
                    };
                    // $scope.departmentListAll = data.items;
                    $scope.userDepartments = userDepartments;
                    // console.log(userDepartments);
                });
            }

            // 获取用户标签
            $scope.userTags = function(userData){
                var tagsRemind = [];
                if(userData.tagList.length != 0){
                    for (var i = userData.tagList.length - 1; i >= 0; i--) {
                        for (var j = $scope.tagsListAll.length - 1; j >= 0; j--) {
                            if(userData.tagList[i].id == $scope.tagsListAll[j].id){
                                tagsRemind.push($scope.tagsListAll[j].name);
                            }
                        };
                    };
                }
                $scope.userTagsModel = (tagsRemind.length != 0) ? tagsRemind : null;
            };

            //转换tagsName--->id
            // $scope.chkTagsModel = function(arr){
            //     var tmp = [];
            //     for (var i = 0;i < $scope.tagsListAll.length ; i++) {
            //         console.log($scope.tagsListAll[i].id,tmp);
            //         for (var j = arr.length - 1; j >= 0; j--) {
            //             if($scope.tagsListAll[i].name == arr[j]){
            //                 tmp.push($scope.tagsListAll[i].id);

            //             }
            //         };

            //     };
            //     $scope.userTagsModelId = tmp;           
            // };

            // 获取所有标签
            $scope.tagsList = function(){
                var tagsUrl = '/japi/qiye/contacttag/list',
                    objTags = {};
                $http.get(tagsUrl).success(function(data){
                    var tagsRemind = [];
                    for (var i = 0;i < data.items.length ; i++) {
                        var tmp = {},
                            name = data.items[i].name,
                            id = data.items[i].id;
                        tmp = {
                                'id': id,
                                'name': name
                            }
                        objTags[id] = tmp;
                        tagsRemind.push(data.items[i].name);
                    };
                    $scope.tagsRemind = tagsRemind;
                    $scope.tagsListAll = data.items;
                    $scope.objTags = objTags;
                })
            };
              
              // 初始化tags标签
              var vm = $scope.vm = {};
              vm.option1 = {
                allowClear:true
              };
              vm.option2 = {
                'multiple': true,
                'simple_tags': true,
                'tags': function(){
                    return $scope.tagsRemind;
                }
              };

            // 更新标签
            $scope.updateUserTag = function(id,tags){
                if(tags)  $scope.userTagsModel = tags;
                for (var i = $scope.userTagsModel.length - 1; i >= 0; i--) {
                    $http({
                        method: 'POST',
                        url: '/japi/qiye/contact/tagging',
                        data: $.param({
                            userId: id,
                            name: $scope.userTagsModel[i],
                            clear: false
                        }),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function(data){
                      
                    });
                };
            }


            
            // 修改用户详情
            $scope.userUpdate = function(userInfo){

                var url= '/japi/qiye/contact/update/test',
                    tmp,
                    user;
                tmp = angular.toJson(userInfo);
                 console.log(userInfo,tmp);
                // $scope.userDirtyCity(userInfo);
                user = {
                    "departmentId": $scope.userDepartment.id,
                    "data":tmp};    
                $.ajax({
                    method: 'POST',
                    url: url,
                    data: user,
                    success: function  (data) {
                        $scope.remindInfor(data);
                        $scope.updateUserTag(userInfo.userId,$scope.userTagsModel);
                        $scope.department_selectedId=null;
                        $scope.isEditInfor = false;
                        $scope.refreshContacts(1,100);
                    }
                })
                // $http({
                //     method: 'POST',
                //     url: url,
                //     data: data,
                //     headers:{'Content-Type':'application/x-www-form-urlencoded'}
                // }).success(function(data){
                //         $scope.remindInfor(data);
                //         $scope.department_selectedId=null;
                //         $scope.isEditInfor = false;
                //         $scope.refreshContacts(1,100);

                // })
            };

            //部门第二条请选择为空的bug fix
            $scope.departmentExist = function(id,level){
                if(!id || !level){
                    $scope.departmentSecond = false;
                    $scope.departmentThird = false;
                }else{
                var url = '/japi/qiye/department/list';
                $http.get(url).success(function(data){
                     for (var i in data.items) {

                            if(level==1 && data.items[i].parent == id){
                                $scope.departmentSecond = true;
                                $scope.departmentThird = false;
                                console.log($scope.departmentSecond);
                            }else if(level==2 && $scope.departmentSecond && data.items[i].parent == id){
                                $scope.departmentSecond = true;
                                $scope.departmentThird = true;
                            }else{
                                $scope.departmentSecond = false;
                                $scope.departmentThird = false;
                            }
                     }
                    })
                }
            };

            // 获取部门列表
            $scope.departmentLists = function(){
                var url = '/japi/qiye/department/list';
                $http.get(url).success(function(data){
                    $scope.departmentListAll = data.items;
                })
            };

            // //编辑用户部门
            // $scope.chooseDepartment = function(userId,departmentId){
            //     $http.post({
            //         method: 'POST',
            //         url: '/japi/qiye/contact/departmentalize',
            //         data: $.param({
            //                 userId: userId,
            //                 id: departmentId
            //         }),
            //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            //     }).success(function(data){
            //         if(data.success){
            //             alert('修改成功');
            //             }
            //     })
            // }

            // checkbox全选
            $scope.chkAll = function(){
                var all = $('.js_checkbox_all')[0],
                    ckList = $('.js_checkbox'),
                    action;
                action = (all.checked?"add":"remove");
                for (var i = ckList.length - 1; i >= 0; i--) {
                    ckList[i].checked = all.checked ?  true : false;
                }
                $scope.isShowBatchEdit=true;
                if(action == 'remove'){
                    $scope.batchUsers = [];
                }if(action == 'add'){
                    $scope.batchUsers = angular.copy($scope.contacts);
                }
            };

            // 批量编辑展示
            $scope.batchUsers = [];

            $scope.showBatchEdit = function($event,user){
                var chkbox = $event.target;
                var action = (chkbox.checked?"add":"remove");
                $scope.isShowBatchEdit=true;
                $scope.updateBatchEdit(action,user);
            };

            // 同步编辑用户操作
            $scope.updateBatchEdit = function(action,user){
                if(!$scope.batchUsers){
                    $scope.isShowBatchEdit=false;
                    return;
                }
                if(action == 'add'){
                    $scope.batchUsers.push(user);
                }else if(action == 'remove'){
                    var index,m;
                    for(m in $scope.batchUsers){
                        if($scope.batchUsers[m].userId == user.userId) index = m;
                    }
                    $scope.batchUsers.splice(index,1);
                }

            };

            //批量关联标签
            $scope.isShowbatchTags = function(){
                $scope.userTagsModel = null;
                var modalInstance = $modal.open({
                    templateUrl: 'batchUsersTag.html',
                    controller: 'ContactsModalController',
                    scope: $scope
                });
                modalInstance.result.then(function(tags){
                    // console.log($scope.batchUsers,$scope.userTagsModel,tags)
                    var tmp = {success:true};
                    $scope.tagAction = false;
                    for (var i = $scope.batchUsers.length - 1; i >= 0; i--) {
                        $scope.updateUserTag($scope.batchUsers[i].userId,tags)
                    };
                    $scope.remindInfor(tmp);
                })
            };
            $scope.statusFilter = function(num){
                console.log('0000',num);
                if(num==3){
                    $scope.refreshContacts(1,100);
                }else{
                    $scope.refreshContacts(1,100,num);
                }
            }

            // 创建用户
            $scope.createUser = function(){
                $scope.departmentTree();
                $scope.tagsList();
                $scope.vm.value2 = null;
                $modal.open({
                    templateUrl: 'createUser.html',
                    controller: 'ContactsModalController',
                    size: '',
                    scope: $scope,
                    resolve: {
                        items: function(){

                        }
                    }
                })
            };

            // 批量导入
            $scope.importAll = function(){
                $modal.open({
                    templateUrl: 'importContact.html',
                    controller: 'ContactsModalController',
                    size: '',
                    scope: $scope,
                    resolve: {
                        items: function(){

                        }
                    }
                })
            };

            $scope.$on('onCitySelected',function(event,item){
                var len = item.cn.length - 1;
                $scope.userCity = null;
            });
            $scope.userDirtyCity = function(data){
                 if($scope.userCity){
                    data.city = angular.copy($scope.userCity);
                    $scope.userCity = null;
                }               
            }


            $scope.dateFormat = function(userinfo,key,date){
                Date.prototype.toHyphenDateString = function() { 
                    var year = this.getFullYear(); 
                    var month = this.getMonth() + 1; 
                    var date = this.getDate(); 
                    if (month < 10) { month = "0" + month; } 
                    if (date < 10) { date = "0" + date; } 
                    var hours = this.getHours();
                    var mins = this.getMin
                    var mins = this.getMinutes();
                    var second = this.getSeconds();
                    return year + "-" + month + "-" + date + " " + hours + ":" + mins + ":" + second;
                };
               date = date.toHyphenDateString();
               userinfo[key] = date;
               // console.log(date,userInfo[key]);

            };
            // 设置用户属性检查 propertyItems


            $scope.propertySamples = {
                        'gender':{
                            'key':'gender',
                            'label':'性别',
                            'type': 'select',
                            'sub_button':['男','女','无'],
                            'required':false
                        },
                        'city':{
                            'key':'city',
                            'label':'城市',
                            'type':'city',
                            'required':false
                        },
                        'citizenshipNumber':{
                            'key':'citizenshipNumber',
                            'label':'身份证',
                            'required':false
                        },
                        'birthday':{
                            'key':'birthday',
                            'label':'出生日期',
                            'type':'date',
                            'required':false
                        },
                        'university':{
                            'key':'university',
                            'label':'毕业院校',
                            'required':false
                        },
                        'graduateddate':{
                            'key':'graduateddate',
                            'label':'毕业日期',
                            'type':'date',
                            'required':false
                        },
                        'major':{
                            'key':'major',
                            'label':'专业方向',
                            'required':false
                        },
                        'degree':{
                            'key':'degree',
                            'label':'学历',
                            'type': 'select',
                            'sub_button': ['高中','本科','硕士','博士','博士后','其他'],
                            'required':false
                        },
                        'staffStatus':{
                            'key':'staffStatus',
                            'label':'员工状态',
                            'type': 'select',
                            'sub_button': ['在职','离职','实习生'],
                            'required':false
                        },
                        'entryTime':{
                            'key':'entryTime',
                            'label':'到职日',
                            'type': 'date',
                            'required':false
                        },
                        'dimissionTime':{
                            'key':'dimissionTime',
                            'label':'离职日',
                            'type': 'date',
                            'required':false
                        },
                        'contactSignTime':{
                            'key':'contactSignTime',
                            'label':'合同签订日',
                            'type': 'date',
                            'required':false
                        },
                        'contactExpireTime':{
                            'key':'contactExpireTime',
                            'label':'合同到期日',
                            'type': 'date',
                            'required':false
                        },
                        'confidentialityAgreement':{
                            'key':'confidentialityAgreement',
                            'label':'保密协议',
                            'type':'checkbox',
                            'required':false
                        },
                        'trainingAgreement':{
                            'key':'trainingAgreement',
                            'label':'培训协议',
                            'type':'checkbox',
                            'required':false
                        },
                        'homePhone':{
                            'key':'homePhone',
                            'label':'家庭电话',
                            'required':false
                        },
                        'registerAddress':{
                            'key':'registerAddress',
                            'label':'户籍地址',
                            'required':false
                        },
                        'address':{
                            'key':'address',
                            'label':'现居住地址',
                            'required':false
                        },
                        'postalCode':{
                            'key':'postalCode',
                            'label':'邮编',
                            'required':false
                        },
                        'fathar':{
                            'key':'fathar',
                            'label':'父亲',
                            'required':false
                        },
                        'mother':{
                            'key':'mother',
                            'label':'母亲',
                            'required':false
                        },
                        'contactNumber':{
                            'key':'contactNumber',
                            'label':'联系电话',
                            'required':false
                        },
                        'custompro':{
                            'key':'custompro',
                            'label':'自定义',
                            'required':false
                        }
            };
            $scope.setProperty = function(){
                $modal.open({
                    templateUrl: 'userProperty.html',
                    controller: 'ContactsModalController',
                    size: '',
                    scope: $scope
                })
            };



            $scope.remove = function(){
                var ids = [],
                    ckList = $('.js_checkbox');
                for (var i = ckList.length - 1; i >= 0; i--) {
                    if(ckList[i].checked == true){
                        ids.push(ckList[i].id)
                    };
                }
                 console.log(ids);

                // prompt({
                //     title: '删除成员',
                //     message: '你确定要删除所选的' + ids.length + '位成员吗?',
                //     "buttons": [
                //         {label:'取消',cancel:true},
                //         {label:'确定',primary:true}
                //     ]
                // }).then(function(){

                //     }
                // ).success(function(data){
                //     if (data.success) {
                //         notify({
                //             message: "删除成功",
                //             classes: "alert-success"
                //         });
                //         $scope.nodeChanged();
                //     }else {
                //         alert(data.message);
                //     }
                // })

            };
            // 开启用户
            $scope.userStart = function(userinfo){
                var url = '/japi/qiye/contact/enable?userId=';
                if(userinfo=='batchUsers'){
                    var succeed = 0,
                        faild = 0;
                    for (var i = $scope.batchUsers.length - 1; i >= 0; i--) {
                        $http.post(url + $scope.batchUsers[i].userId).success(function(data){
                            if(data.success) {
                                succeed += 1;
                            }else{
                                faild += 1;
                            }
                            console.log(succeed,faild)
                        })
                    };
                    notify({
                        message: '修改成功',
                        classes: 'alert-success'
                    });
                    $scope.statusFilterrefreshContacts(1,100);
                    console.log($scope.batchUsers.length);
                }else{
                    $http.post(url + userinfo.userId).success(function(data){
                        $scope.remindInfor(data);
                        userinfo.status = 1;
                    })
                }
            };

            // 禁用用户
            $scope.userForbidden = function(userinfo){
                var url = '/japi/qiye/contact/enable?userId=';
                if(userinfo=='batchUsers'){
                    var succeed = 0,
                        faild = 0;
                    for (var i = $scope.batchUsers.length - 1; i >= 0; i--) {
                        $http.post(url + $scope.batchUsers[i].userId).success(function(data){
                            if(data.success) {
                                succeed += 1;
                            }else{
                                faild += 1;
                            }
                            console.log(succeed,faild)
                        })
                    };
                    notify({
                        message: '修改成功',
                        classes: 'alert-success'
                    });
                    $scope.refreshContacts(1,100);
                }else{
                    $http.post(url + userinfo.userId).success(function(data){
                        userinfo.status = 0;
                        console.log(data);
                    })
                }

            };
            $scope.moveBatchUserChoose = function(){
                $scope.departmentTree();
                $modal.open({
                    templateUrl: 'moveBatchUserChoose.html',
                    controller: 'ContactsModalController',
                    scope: $scope
                });
                modalInstance.result.then(function(batchDepartmentId){
                    $scope.moveBatchUser(batchDepartmentId);
                })
            };

            $scope.chckUserBlack = function(id){
                $scope.isShowUserBlack = false;
                var url = '/japi/qiye/contact/blacklist';
                $http.get(url).success(function(data){
                    for (var i = data.items.length - 1; i >= 0; i--) {
                        if(data.items[i].id == id){
                            $scope.isShowUserBlack = true;
                        }
                    };
                })
            };

            $scope.blackUser = function(userinfo){
                var url = '/japi/qiye/contact/delete?userId=';
                $http.post(url + userinfo.userId).success(function(data){
                    $scope.remindInfor(data);
                    $scope.refreshContacts(1,100);
                })
            };

            $scope.washedUser = function(userinfo){
                var url = '/japi/qiye/contact/recover?userId=';
                $http.post(url + userinfo.userId).success(function(data){
                    $scope.remindInfor(data);
                    $scope.refreshContacts(1,100);
                })
            }
        }]);

// contact_module.filter('startFrom', function() {
//     return function(input, start) {
//         start = +start; //parse to int
//         return input.slice(start);
//     }
// });

    // ContactsModalController
contact_module
    .controller('ContactsModalController',['$scope', '$http', '$modal','$timeout','$modalInstance','FileUploader','notify',
        function($scope, $http, $modal, $timeout, $modalInstance, FileUploader,notify){
            // 新建用户提交
            $scope.saveContact = function(){
                var url = '/japi/qiye/contact/test',
                    tmp;
                // $scope.userDirtyCity($scope.newUser);
                tmp = angular.toJson($scope.newUser);
                $.ajax({
                    method: 'POST',
                    url: url,
                    data: {departmentId:$scope.department_selectedNewId,data:tmp},
                    success: function(data){
                        if(data.success){
                              notify({
                                message: "添加成功!",
                                classes: "alert-success"
                            });
                            if($scope.vm.value2){
                                 $scope.updateUserTag(data.userId,$scope.vm.value2);
                            }
                            $modalInstance.dismiss('cancel'),
                            $timeout(function(){
                                $scope.refreshContacts(1,100);
                            },1000);                          
                        }else{
                            $scope.remindInfor(data);
                        }
                    }
                });

                    // $http({
                    //     method: 'POST',
                    //     url: '/japi/qiye/contact/create',
                    //     data: $.param({
                    //         position: $scope.contactPosition,
                    //         mobile: $scope.contactMobile,
                    //         email: $scope.contactEmail,
                    //         wxid: $scope.contactWx,
                    //         name: $scope.contactName,
                    //         departmentId: $scope.department_selectedId
                    //     }),
                    //     headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    // }).success(function(data){
                    //     console.log(data);
                    //     if(data.success){
                    //         notify({
                    //             message: "添加成功!",
                    //             classes: "alert-success"
                    //         });
                    //         if($scope.vm.value2){
                    //             $scope.updateUserTag(data.userId,$scope.vm.value2);
                    //         // var tagsList = $scope.contactTags1.split(' ');
                    //         //     for (var i = tagsList.length - 1; i >= 0; i--) {
                    //         //         $http({
                    //         //             method: 'POST',
                    //         //             url: '/japi/qiye/contact/tagging',
                    //         //             data: $.param({
                    //         //                 userId: data.userId,
                    //         //                 name: tagsList[i],
                    //         //                 clear: false
                    //         //             }),
                    //         //             headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    //         //         }).success(function(data){
                    //         //           // console.log(11,data);
                    //         //         });
                    //         //     };
                    //         }
                    //         $modalInstance.dismiss('cancel'),
                    //         $timeout(function(){
                    //             $scope.refreshContacts(1,100);
                    //         },1000);
                    //     }else{
                    //         alert(data.message);
                    //     }
                    // })

            };
            // 关闭modal
            $scope.cancelModal = function () {
                $modalInstance.close();
            }
            // show_tags input
            $scope.showTagsInput = function(contactTags1){
                var tmp = contactTags1;
                if(!$scope.contactTags1){$scope.contactTags1 = '';}
                $scope.tagsRemidStatus = true;
            };

            $scope.hideTagsInput = function(){
                $scope.tagsRemidStatus = false;
            };
            // add_tags
            $scope.addTags = function(tagId,tagName){
                // var length = $scope.contactTags1.length + 1;
                if(!$scope.contactTags1){
                    $scope.contactTags1 = tagName
                }
                 else{
                    $scope.contactTags1 += ' ' + tagName
                }
            };

            // 批量导入联系人
            $scope.uploadContact = new FileUploader({
                url: "/japi/file/upload",
                alias: "uploadFile",
                autoUpload: true,
                filters: [{
                    name: 'fileFilter',
                    fn: function(item /*{File|FileLikeObject}*/, options) {
                        var type = '|' + item.name.slice(item.name.lastIndexOf('.') + 1) + '|';
                        var isFileType = '|csv|'.indexOf(type) !== -1;
                        if(!isFileType) {
                            notify({
                                message: "上传失败，仅支持 csv 文件类型",
                                classes: "alert-danger" // alert-danger
                            });
                        }
                        return isFileType;
                    }
                }],
                onWhenAddingFileFailed: function(item /*{File|FileLikeObject}*/, filter, options) {
                    // $log.log('onWhenAddingFileFailed', item, filter, options);
                },
                onAfterAddingFile: function(fileItem) {
                    // $log.log('onAfterAddingFile', fileItem);
                },
                onAfterAddingAll: function(addedFileItems) {
                    // $log.log('onAfterAddingAll', addedFileItems);
                },
                onBeforeUploadItem: function(item) {
                    // $log.log('onBeforeUploadItem', item);
                },
                onProgressItem: function(fileItem, progress) {
                    // $log.log('onProgressItem', fileItem, progress);
                },
                onProgressAll: function(progress) {
                    // $log.log('onProgressAll', progress);
                    $scope.uploadProgress = progress;
                    $scope.isUploading = true;
                },
                onSuccessItem: function(item, response, status, headers) {
                    console.info(response)
                    if(response.success) {
                        console.log(response.fileId);
                        $http({
                            method: 'POST',
                            url: '/japi/qiye/contact/import/save',
                            data: $.param({
                                'attachfileId': response.fileId
                            }),
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }).success(function(data){
                            $scope.importContactStatus = 0;
                            $scope.checkStatus = setInterval(function(){
                                $scope.importContactResult(data.batch)
                            },1000);

                        })
                    } else {
                        notify({
                            message: "上传失败，文件" + response.message,
                            classes: "alert-danger"
                        });
                    }
                },
                onErrorItem: function(fileItem, response, status, headers) {
                    // $log.log('onErrorItem', fileItem, response, status, headers);
                },
                onCancelItem: function(fileItem, response, status, headers) {
                    // $log.log('onCancelItem', fileItem, response, status, headers);
                },
                onCompleteItem: function(fileItem, response, status, headers) {
                    // $log.log('onCompleteItem', fileItem, response, status, headers);
                },
                onCompleteAll: function() {
                    // $log.log('onCompleteAll');
                }
            });

            $scope.importContactResult = function(id){
                $http({
                    method: 'POST',
                    url: '/japi/qiye/contact/import/check/' + id,
                    data: $.param({
                        batch: id
                    }),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data){
                    if(data.success){
                        $scope.importContactStatus = 1;
                        notify({
                            message: "成功上传" + data.successCount + '人，失败' + data.failureCount + '人',
                            classes: "alert-success"
                        });
                    if($scope.importContactStatus == 1){
                        clearInterval($scope.checkStatus);
                    }
                    console.log(1);
                    }
                })
            };
            // 批量移动用户
            $scope.moveBatchUser = function(){
                var url = "/japi/qiye/contact/departmentalize";
                for (var i = $scope.batchUsers.length - 1; i >= 0; i--) {
                    $http.post({
                        method: 'POST',
                        url: url,
                        data: $.param({
                            userId: $scope.batchUsers[i].userId,
                            id: $scope.batchDepartmentId
                        }),
                        headers:{'Content-Type':'application/x-www-form-urlencoded'}
                    })
                };
                notify({
                    message: '移动成功',
                    classes: 'alert-success'
                })
                $scope.refreshContacts(1,100);
            };

            // 批量关联标签提交
            $scope.batchUsersTags = function(){
                $modalInstance.close($scope.userTagsModel);
            };

            // 增加自定义属性
            $scope.addProSample = function(moreProperty){
                // console.log(moreProperty);
                if(moreProperty.key=="custompro") return;
                var len = $scope.propertyItems.length + 1;
                $scope.propertyItems.splice(len,0,moreProperty);
                // console.log($scope.propertyItems);
            };

            $scope.addProSampleText = function (customProInput) {
                if(!customProInput)  return;
                var input = angular.copy(customProInput),
                    tmp = {
                            'key': '',
                            'label':input,
                            'required':false
                        },
                    len = $scope.propertyItems.length + 1;
                $scope.propertyItems.splice(len,0,tmp);
                $scope.customProInput = null;
            };

            // 删除自定义属性
            $scope.removeProSample = function  (index) {
                index = index + 8;
                $scope.propertyItems.splice(index,1)
            };

            // 保存自定义属性
            $scope.saveProSample = function (){
                var tmp;
                tmp = angular.toJson($scope.propertyItems);
                // var test = {"data":tmp}
                // alert(a);
                var url  = "/japi/qiye/contact/formconfig";
                $.ajax({
                    method: 'POST',
                    url:url,
                    data:{data:tmp},
                    success:function (data) {
                       $scope.remindInfor(data);
                       if(data.success){
                            $timeout(function() {
                                location.reload()
                             }, 600);
                        }
                    }
                })
            };
        }
        ]);
