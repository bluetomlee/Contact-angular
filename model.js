'use strict';
// epdApp
var contact_module = angular.module('epdApp.contacts', ['ngRoute','ui.bootstrap','cgPrompt',])
    .controller('ContactsController', ['$scope', '$http', '$rootScope', '$timeout','$modal','notify','prompt',
        function($scope, $http, $rootScope, $timeout,$modal,notify,prompt) {

            $scope.nodeChanged = function(newNode) {
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
                var refreshContacts = $scope.refreshContacts = function(page, size,status){
                    // 拼装GET链接
                    var dataUrl = '/japi/qiye/contact/list/bydeparment?id=' + newNode.subid + "&size="+ size +"&page=" + page;
                    if(status){
                        dataUrl = '/japi/qiye/contact/list/bydeparment?id=' + newNode.subid + "&size="+ size +"&page=" + page +"&status=" + status.num;
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

            $scope.removeTag = function(index,id){
                $scope.tagsListAll.splice(index,1);
                $http({
                    method: 'POST',
                    url: '/japi/qiye/contacttag/delete',
                    data: $.param({
                        id: id
                    }),
                    headers:{'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data){
                    if(data.success){
                        console.log(data);
                    }
                })
            };

            $scope.editTag = function(data){
                prompt({
                    title: '输入标签名',
                    input: true,
                    value: data.name,
                    "buttons":[
                        {label:'取消',cancel:true},
                        {label:'修改',primary:true}
                    ]
                }).then(function(name){
                    data.name = name;
                    $http({
                        method: 'POST',
                        url: '/japi/qiye/contacttag/update',
                        data: $.param({
                            name: data.name,
                            id: data.id
                        }),
                        headers:{'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function(data){

                    })
                })

            }
            $scope.addTag = function(newTag){
                // if(!newtag) return;
                var tmp = {name:newTag};
                $scope.tagsListAll.push(tmp);
                $http({
                    method: 'POST',
                    url: '/japi/qiye/contacttag/create',
                    data: $.param({
                        name: newTag
                    }),
                    headers:{'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(data){
                    if(data.success){
                        var len = $scope.tagsListAll.length -1;
                        $scope.tagsListAll[len].id = data.id;
                        $scope.newTag = null;
                    }else{
                        console.log(data)
                    }
                })
            };

            // 设置成员属性
            $scope.showProperty = function(){
                var url;
                $http.get(url).success(function(data){
                    console.log(data)
                })
            };

            $scope.epdEditContact = function(contactId, userData) {
                // console.log(contactId);

                // 控制 userData 显示与否
                $scope.userDepartment = null;
                $scope.userinfo = userData;
                $scope.isShowUserInfo = true;
                $scope.isEditInfor = false;
                var dpUrl = '/japi/qiye/department/list';
                $http.get(dpUrl).success(function(data){
                    var userDepartments=[];
                    var len = userData.departmentList.length-1;
                    for (var i = 0;i < data.items.length ; i++) {
                        if(data.items[i].id == userData.departmentList[len].id){
                            $scope.userDepartment = data.items[i];  
                            $scope.userDepartment.index = i ;            
                        }if(data.items[i].level == 1){
                            userDepartments.push(data.items[i])
                            for (var j = 0;j < data.items.length ; j++) {
                                if(data.items[j].parent == data.items[i].id){
                                    // data.items[j].name ='-' + data.items[j].name;
                                    userDepartments.push(data.items[j])
                                    for (var t = 0;t < data.items.length ; t++) {
                                        // data.items[t].name ='----' + data.items[t].name;
                                        // console.log(data.items[t].name);
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
                    $scope.departmentListAll = data.items;
                    $scope.userDepartments = userDepartments;
                    // console.log(userDepartments);
                });
                // 显示
                // $(".panel-box").animate({right:"0"},500);
            };


            // 编辑用户详情

            $scope.editUserinfor = function(id){
                $scope.isEditInfor = true;
                $scope.tagsList();
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
                    console.log(userDepartments);
                });
            }
            //获取用户标签
            $scope.tagsList = function(){
                var tagsUrl = '/japi/qiye/contacttag/list';
                $http.get(tagsUrl).success(function(data){
                    var tagsRemind = [];
                    for (var i = data.items.length - 1; i >= 0; i--) {
                        var tmp = {text:data.items[i].name}
                        tagsRemind.push(tmp);
                    };
                    $scope.tagsRemind = {
                        'multiple': true,
                        'simple_tags': true,
                        'tags': tagsRemind
                    };
                    $scope.tagsListAll = data.items;

                    console.log($scope.tagsRemind)
                })
            };

            $scope.loadTags = function($query){
                var deferred = $q.defer();
                deferred.resolve(['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5']);
                return deferred.promise;
            };
            // 修改用户详情
            $scope.userUpdate = function(){
                $scope.department_selected1 = $("#department option:selected").val();
                console.log($scope.department_selected1)
                var data = $.param({
                        userId: $scope.userinfo.userId,
                        position: $scope.userinfo.position,
                        mobile: $scope.userinfo.mobile,
                        telephone: $scope.userinfo.telephone,
                        email: $scope.userinfo.email,
                        wxid: $scope.userinfo.wxid,
                        name: $scope.userinfo.name,
                        departmentId: $scope.department_selected1
                    });
                if(!$scope.userinfo.departments){delete data.departmentId}
                // $http.get('/japi/qiye/department/list')teamId
                var url = '/japi/qiye/contact/update';
                $http({
                    method: 'POST',
                    url: url,
                    data: data,
                    headers:{'Content-Type':'application/x-www-form-urlencoded'}
                }).success(function(data){
                        if (data.success==true) {
                            alert('修改成功');

                        }
                        else{
                            alert(data.message);
                        }
                        $scope.department_selectedId=null;
                        $scope.refreshContacts(1,100);

                })
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

            $scope.statusParam = [
                {"num":3,"name":"所有"},
                {"num":2,"name":"已关注"},
                {"num":1,"name":"未关注"},
                {"num":0,"name":"禁用"}
            ];

            $scope.statusFilter = function(status){
                console.log('0000',status.num);
                if(status.num==3){
                    $scope.refreshContacts(1,100);
                }else{
                    $scope.refreshContacts(1,100,status);              
                }
            }

            // 创建用户
            $scope.createUser = function(){
                $scope.departmentLists();
                $scope.tagsList();
                $('.add_tags').click(function(){
                    alert(1)
                })
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

            // 设置用户属性
            $scope.userProperty = function(){
                var url;
                $http.get(url).success(function(data){
                    propertys = data.items;
                });
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


            $scope.blackUser = function(userinfo){
                var url = '/japi/qiye/contact/delete?userId=';
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
                if($scope.department_selected1 || $scope.department_selected2 || $scope.department_selected3){
                    $scope.department_selectedId = $scope.department_selected1;
                    if($scope.department_selected2){$scope.department_selectedId = $scope.department_selected2}
                    if($scope.department_selected3){$scope.department_selectedId = $scope.department_selected3}
                }else if(!$scope.department_selectedId){alert('请填写部门');return};
                    console.log(1111,$scope.department_selectedId);
                    $http({
                        method: 'POST',
                        url: '/japi/qiye/contact/create',
                        data: $.param({
                            position: $scope.contactPosition,
                            mobile: $scope.contactMobile,
                            // gender: $scope.,
                            // telephone: $scope.telephone,
                            email: $scope.contactEmail,
                            wxid: $scope.contactWx,
                            name: $scope.contactName,
                            departmentId: $scope.department_selectedId.id
                        }),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).success(function(data){
                        console.log(data);
                        if(data.success){
                            notify({
                                message: "添加成功!",
                                classes: "alert-success"
                            });
                            if($scope.contactTags1){
                            var tagsList = $scope.contactTags1.split(' ');
                                for (var i = tagsList.length - 1; i >= 0; i--) {
                                    $http({
                                        method: 'POST',
                                        url: '/japi/qiye/contact/tagging',
                                        data: $.param({
                                            userId: data.userId,
                                            name: tagsList[i],
                                            clear: false
                                        }),
                                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                    }).success(function(data){
                                      // console.log(11,data);
                                    });
                                };
                            }
                            $modalInstance.dismiss('cancel'),
                            $timeout(function(){
                                $scope.refreshContacts(1,100);
                            },1000);
                        }else{
                            alert(data.message);
                        }
                    })
                
            };

            $scope.saveContactNew = function(){
                $scope.saveContact();
                $('#saveContactNew').click();
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


        }
        ]);
