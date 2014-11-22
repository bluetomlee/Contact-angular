'use strict';
// epdApp
var contact_module = angular.module('epdApp.contacts', ['ngRoute','ui.bootstrap','cgPrompt',])
    .controller('ContactsController', ['$scope', '$http', '$rootScope', '$timeout','$modal',
        function($scope, $http, $rootScope, $timeout,$modal,$filter) {

            $scope.nodeChanged = function(newNode) {
                // do something when node changed
                // console.log('update ' + newNode.subid);
                // 双向绑定数据更新

                var size = 50;
                if(newNode.subid == 0) {
                    size = 100;
                }
                $scope.currentPage = 1;
                $scope.pageSize = 20;
                // 拼装GET链接
                var dataUrl = 'list/bydeparment?id=' + newNode.subid + "&size="+ size +"&page=" + 1;

                $http.get(dataUrl).success(function(data) {
                    // console.info(data);
                    console.info(data);
                    $scope.contacts = data.items;
                    $scope.numberOfPages = function(){
                        var tmpData = $filter('filter')($scope.contacts,$scope.search);
                        return Math.ceil(tmpData.length/$scope.pageSize);
                    }
                });
            };

            // 初始化的数据难
            // $http.get('list/bydeparment?id=0&size=100')
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
                // 显示
                // $(".panel-box").animate({right:"0"},500);
            };

            // 编辑用户详情

            $scope.isEditInfor = false;
            $scope.editUserinfor = function(){
                $scope.isEditInfor = true;

            };

            $scope.submit = function(){
                var url = 'update?userId=' + $scope.userinfo.userId + '&position=' + $scope.userinfo.position + '&mobile=' + $scope.userinfo.mobile + '&gender=' + $scope.userinfo.gender +'&telephone=' + $scope.userinfo.telephone + '&email=' + $scope.userinfo.email + '&wxid=' + $scope.userinfo.wxid +'&name=' + $scope.userinfo.name;
                $http.post(url,{
                    header: {'Content-Type':'application/x-www-form-urlencoded'}
                }).success(function(data){
                    console.log(1,$scope.userinfo);
                    console.log(2,data);
                })
            };

            // checkbox全选
            $scope.chkAll = function(){
                var all = $('.js_checkbox_all')[0],
                    ckList = $('.js_checkbox');
                for (var i = ckList.length - 1; i >= 0; i--) {
                    ckList[i].checked = all.checked ?  true : false; 
                }               
            };
            // 创建用户
            $scope.createUser = function(){
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
                $http.post('enable?userId=' + userinfo.userId).success(function(data){
                    console.log(data);
                    userinfo.status = 1;
                })
            };

            // 禁用用户
            $scope.userForbidden = function(userinfo){
                $http.post('disable?userId=' + userinfo.userId).success(function(data){
                    userinfo.status = 0;
                    console.log(data);
                })
            };

            $scope.userMore = function(){

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
    .controller('ContactsModalController',['$scope','$http','routeParams','$rootScope','timeout','$modal','$log','$modalInstance','prompt','notify',
        function($scope, $http, $routeParams, $rootScope, $timeout, $modal, $log, $modalInstance, prompt ,notify){



        }
        ]);
