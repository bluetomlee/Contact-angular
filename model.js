'use strict';
// epdApp
var contact_module = angular.module('epdApp.contacts', ['ngRoute','ui.bootstrap','cgPrompt',])
    .controller('ContactsController', ['$scope', '$http', '$rootScope', '$timeout','$modal','notify',
        function($scope, $http, $rootScope, $timeout,$modal,$filter,notify) {

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
                var refreshContacts = $scope.refreshContacts = function(page, size){
                    // 拼装GET链接
                    var dataUrl = '/japi/qiye/contact/list/bydeparment?id=' + newNode.subid + "&size="+ size +"&page=" + page;
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

            // 初始化的数据难
            // $http.get('/japi/qiye/contact/list/bydeparment?id=0&size=100')
            //    .success(function(data) {
            //        // 为什么会请求两次
            //        // console.info(data.items);
            //        $scope.contacts = data.items;
            //    });

            $scope.epdEditContact = function(contactId, userData) {
                // console.log(contactId);

                // 控制 userData 显示与否
                $scope.userinfo = userData;
                $scope.isShowUserInfo = true;
                $scope.isEditInfor = false;
                var dpUrl = '/japi/qiye/department/list';
                $http.get(dpUrl).success(function(data){
                    var userDepartments=[];
                    var len = userData.departmentList.length-1;
                    for (var i = 0;i < data.items.length ; i++) {
                        if(data.items[i].id == userData.departmentList[len].id){
                            $scope.userDepartment = data.items[i].name;               
                        }else if(data.items[i].level == 1){
                            userDepartments.push(data.items[i])
                            for (var j = 0;j < data.items.length ; j++) {
                                if(data.items[j].parent == data.items[i].id){
                                    // data.items[j].name ='-' + data.items[j].name;
                                    userDepartments.push(data.items[j])
                                    for (var t = 0;t < data.items.length ; t++) {
                                        // data.items[t].name ='----' + data.items[t].name;
                                        console.log(data.items[t].name);
                                        if(data.items[t].parent == data.items[j].id){
                                            userDepartments.push(data.items[t])
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

            //获取用户标签
            $scope.tagsList = function(){
                var tagsUrl = '/japi/qiye/contacttag/list';
                $http.get(tagsUrl).success(function(data){
                    $scope.tagsListAll = data.items;
                    // console.log(data.items)
                })
            }
            // 修改用户详情
            $scope.userUpdate = function(){
                if($scope.department_selected1){
                    $scope.department_selected1 = $("#department option:selected").val();
                }
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
                    ckList = $('.js_checkbox');
                for (var i = ckList.length - 1; i >= 0; i--) {
                    ckList[i].checked = all.checked ?  true : false; 
                }

            };
            $scope.statusFilter = function(num){
                if(num == 3){
                    $scope.statusFilterResult = null;
                }else if(num ==1 || num == 0){
                    $scope.statusFilterResult = (num == 1 ? {status:1} : {status:0});
                }
                 //已关注 未关注
                console.log(statusFilterResult);
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
            }
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
                $http.post('/japi/qiye/contact/enable?userId=' + userinfo.userId).success(function(data){
                    console.log(data);
                    userinfo.status = 1;
                })
            };

            // 禁用用户
            $scope.userForbidden = function(userinfo){
                $http.post('/japi/qiye/contact/disable?userId=' + userinfo.userId).success(function(data){
                    userinfo.status = 0;
                    console.log(data);
                })
            };
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


        }
        ]);
