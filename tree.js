'use strict';
// use contacts.js
contact_module.directive('jstree', ['$timeout', '$parse', 'prompt', '$http', '$log', function($timeout, $parse, prompt, $http, $log) {

    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            apiBase: '@',
            apiRoot: '@',
            selectedNode: '=',
            selectedNodeChanged: '='
        },
        link: function(scope, element, attrs) {
            $(function(){
                var treeElement = $(element);

                var tree = treeElement.jstree({
                    "core" : {
                        "animation" : 0,
                        "check_callback" : true,
                        "themes" : { "default" : true },
                        "data" : function(obj, cb) {
                            $.get("/japi/qiye/department/list", function(data){
                                var treeData = data.items;
                                function formatJstreeJson(json) {
                                    var jstreeData = [{
                                        id: 0,
                                        text: "组织架构",
                                        parent: "#"
                                    },{
                                        id: 999999,
                                        text: "黑名单",
                                        parent: "#"}
                                    ];
                                    $.each(json,function(index, value){
                                        var newObj = {
                                            id          : value.id,
                                            text        : value.name,
                                            parent      : value.parent
                                        }
                                        jstreeData.push(newObj);
                                    });
                                    return jstreeData;
                                }
                                var ad = formatJstreeJson(treeData);
                                console.info(ad);
                                cb.call(this, ad);
                            }, 'json');
                        }
                    },
                    "plugins" : [ "contextmenu", "dnd", "search", "state", "types", "wholerow" ],
                    "contextmenu": {
                        // 具体配置选项请参考jstree源文件 5070行
                        items : function (o, cb) { // Could be an object directly
                            if(o.id == 999999) return false;
                            return {
                                "create" : {
                                    "label"             : "添加子部门",
                                    "action"            : function (data) {
                                        var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);
                                        // alert('data');
                                        prompt({
                                            title: '添加子部门',
                                            /*message: '请输入新部门名称?',*/
                                            input: true,
                                            /* label: '名称', */
                                            value: '新部门名称',
                                            "buttons": [
                                                {label:'取消',cancel:true},
                                                {label:'创建',primary:true}
                                            ]
                                        }).then(function(Newname) {
                                            //the promise is resolved with the user input
                                            //he hit ok and not cancel
                                            // obj.text = Newname;

                                            console.log(obj);
                                            // if(obj.id == "#"){obj.id=0};
                                            $http({
                                                method: 'POST',
                                                url: '/japi/qiye/department/create',
                                                data: $.param({
                                                    name: Newname,
                                                    parent: obj.id
                                                }),
                                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                            }).success(function(data) {
                                                if(data.success) {
                                                    inst.create_node(obj, {
                                                        "id": data.id,
                                                        "text": Newname
                                                    }, "last", function (new_node) {
                                                        $log.log("创建成功");
                                                        console.log(new_node,111);
                                                        /* setTimeout(function () { inst.edit(new_node); },0);*/
                                                    });
                                                } else {
                                                    alert(data.message);
                                                }
                                            });

                                            /* 默认的方法
                                             var inst = $.jstree.reference(data.reference),
                                             obj = inst.get_node(data.reference);
                                             inst.create_node(obj, {}, "last", function (new_node) {
                                             setTimeout(function () { inst.edit(new_node); },0);
                                             });
                                             */
                                        });

                                    }
                                },
                                "rename" : {
                                    "label"             : "重命名",
                                    "action"            : function (data) {

                                        var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);

                                        prompt({
                                            title: '修改部门名称',
                                            /*message: '请输入新部门名称?',*/
                                            input: true,
                                            /* label: '名称', */
                                            value: obj.text,
                                            "buttons": [
                                                {label:'取消',cancel:true},
                                                {label:'修改',primary:true}
                                            ]
                                        }).then(function(Newname) {
                                            // 重命名
                                            $http({
                                                method: 'POST',
                                                url: '/japi/qiye/department/update',
                                                data: $.param({
                                                    name: Newname,
                                                    id: obj.id
                                                }),
                                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                            }).success(function(data) {
                                                if(data.success) {
                                                    inst.rename_node(obj, Newname);
                                                } else {
                                                    alert(data.message);
                                                }
                                            });
                                        });

                                        // inst.edit(obj);
                                    }
                                },
                                "remove" : {
                                    "label"             : "删除",
                                    "action"            : function (data) {
                                        var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);
                                        prompt({
                                            title: '请确认',
                                            message: '是否要删除「' + obj.text + '」部门？',
                                            "buttons": [
                                                {label:'取消',cancel:true},
                                                {label:'确认删除',primary:true}
                                            ]
                                        }).then(function(Newname) {
                                            //the promise is resolved with the user input
                                            //he hit ok and not cancel
                                            // obj.text = Newname;

                                            $http({
                                                method: 'POST',
                                                url: '/japi/qiye/department/delete',
                                                data: $.param({
                                                    id: obj.id
                                                }),
                                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                            }).success(function(data) {
                                                if(data.success) {
                                                    inst.delete_node(obj);
                                                } else {
                                                    alert(data.message);
                                                }
                                            });
                                        });

                                        /*
                                         if(inst.is_selected(obj)) {
                                         inst.delete_node(inst.get_selected());
                                         }
                                         else {
                                         inst.delete_node(obj);
                                         }
                                         */
                                    }
                                }
                            };
                        }
                    }
                });

                // 创建节点回调
                tree.bind('create_node.jstree', function(evt, obj) {
                    console.info('create_node after');
                });

                // 重命名回调
                tree.bind('rename_node.jstree', function(evt, obj){
                    console.info('rename_node after');
                });

                // 删除节点回调
                tree.bind('delete_node.jstree', function(evt, obj){
                    console.info('delete_node after');
                });

                // 选中节点回调（结合scope双向绑定）
                tree.bind('select_node.jstree', function(evt, obj) {
                    $timeout(function() {
                        scope.selectedNode = {
                            id: treeElement.find('.jstree-clicked').attr('id'),
                            text: treeElement.find('.jstree-clicked').text(),
                            subid: treeElement.jstree('get_selected')[0]
                        };
                        if (scope.selectedNodeChanged) {
                            $timeout(function() {
                                scope.selectedNodeChanged(scope.selectedNode);
                            });
                        }
                    });
                });

                // 显示菜单回调
                tree.bind("show_contextmenu.jstree", function(node, x, y) {
                    $log.log("show_contextmenu after");
                });

            });
        }
    };

}]
);
contact_module.directive('jstagtree', ['$timeout', '$parse', 'prompt', '$http', '$log', function($timeout, $parse, prompt, $http, $log) {

    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {
            apiBase: '@',
            apiRoot: '@',
            selectedNode: '=',
            selectedNodeChanged: '='
        },
        link: function(scope, element, attrs) {
            $(function(){
                var treeElement = $(element);
                var tagtree = treeElement.jstree({
                    "core" : {
                        "animation" : 0,
                        "check_callback" : true,
                        "themes" : { "stripes" : true },
                        "data" : function(obj, cb) {
                            $.get("/japi/qiye/contacttag/list", function(data){
                                var treeData = data.items;
                                function formatJstreeJson(json) {
                                    var tagsData = [];
                                    $.each(json,function(index, value){
                                        var tagsObj = {
                                            id          : value.id,
                                            text        : value.name,
                                            parent      : value.parent
                                        };
                                        tagsData.push(tagsObj);
                                    });
                                    return tagsData;
                                }
                                var ad = formatJstreeJson(treeData);
                                cb.call(this, ad);
                            }, 'json');
                        }
                    },
                    "types" : {
                        "default" : {
                            icon : "fa fa-tag"
                        }
                    } ,
                    "checkbox" : {
                        "keep_selected_style" : false
                    },
                    "plugins" : [ "types", "wholerow","contextmenu" ],
                    "contextmenu": {
                        // 具体配置选项请参考jstree源文件 5070行
                        items : function (o, cb) { // Could be an object directly
                            if(o.id == 999999) return false;
                            return {
                                "create" : {
                                    "label"             : "添加新标签",
                                    "action"            : function (data) {
                                        var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);
                                        // alert('data');
                                        prompt({
                                            title: '添加标签',
                                            /*message: '请输入新部门名称?',*/
                                            input: true,
                                            /* label: '名称', */
                                            value: '新标签名称',
                                            "buttons": [
                                                {label:'取消',cancel:true},
                                                {label:'创建',primary:true}
                                            ]
                                        }).then(function(Newname) {
                                            //the promise is resolved with the user input
                                            //he hit ok and not cancel
                                            // obj.text = Newname;

                                            console.log(obj);
                                            // if(obj.id == "#"){obj.id=0};
                                            $http({
                                                method: 'POST',
                                                url: '/japi/qiye/contacttag/create',
                                                data: $.param({
                                                    name: Newname
                                                }),
                                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                            }).success(function(data) {
                                                if(data.success) {
                                                    inst.create_node("#", {
                                                        "id": data.id,
                                                        "text": Newname
                                                    }, "last", function (new_node) {
                                                        $log.log("创建成功");
                                                        console.log(new_node,111);
                                                        /* setTimeout(function () { inst.edit(new_node); },0);*/
                                                    });
                                                } else {
                                                    alert(data.message);
                                                }
                                            });
                                        });

                                    }
                                },
                                "rename":{
                                    "label"             : "重命名",
                                    "action"            : function (data) {

                                        var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);

                                        prompt({
                                            title: '修改标签名称',
                                            /*message: '请输入新部门名称?',*/
                                            input: true,
                                            /* label: '名称', */
                                            value: obj.text,
                                            "buttons": [
                                                {label:'取消',cancel:true},
                                                {label:'修改',primary:true}
                                            ]
                                        }).then(function(Newname) {
                                            // 重命名
                                            $http({
                                                method: 'POST',
                                                url: '/japi/qiye/contacttag/update',
                                                data: $.param({
                                                    name: Newname,
                                                    id: obj.id
                                                }),
                                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                            }).success(function(data) {
                                                if(data.success) {
                                                    inst.rename_node(obj, Newname);
                                                } else {
                                                    alert(data.message);
                                                }
                                            });
                                        });

                                        // inst.edit(obj);
                                    }
                                },
                                    "remove" : {
                                    "label" : "删除",
                                    "action"            : function (data) {
                                        var inst = $.jstree.reference(data.reference),
                                            obj = inst.get_node(data.reference);
                                        prompt({
                                            title: '请确认',
                                            message: '是否要删除「' + obj.text + '」标签？',
                                            "buttons": [
                                                {label:'取消',cancel:true},
                                                {label:'确认删除',primary:true}
                                            ]
                                        }).then(function(Newname) {
                                            //the promise is resolved with the user input
                                            //he hit ok and not cancel
                                            // obj.text = Newname;

                                            $http({
                                                method: 'POST',
                                                url: '/japi/qiye/contacttag/delete',
                                                data: $.param({
                                                    id: obj.id
                                                }),
                                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                            }).success(function(data) {
                                                if(data.success) {
                                                    inst.delete_node(obj);
                                                } else {
                                                    alert(data.message);
                                                }
                                            });
                                        });
                                    }
                                }
                            };
                        }
                    }
                });

                // 创建节点回调
                tagtree.bind('create_node.jstree', function(evt, obj) {
                    console.info('create_node after');
                });

                // 重命名回调
                tagtree.bind('rename_node.jstree', function(evt, obj){
                    console.info('rename_node after');
                });

                // 删除节点回调
                tagtree.bind('delete_node.jstree', function(evt, obj){
                    console.info('delete_node after');
                });

                // 选中节点回调（结合scope双向绑定）
                tagtree.bind('select_node.jstree', function(evt, obj) {
                    $timeout(function() {
                        scope.selectedNode = {
                            id: treeElement.find('.jstree-clicked').attr('id'),
                            text: treeElement.find('.jstree-clicked').text(),
                            subid: treeElement.jstree('get_selected')[0]
                        };
                        if (scope.selectedNodeChanged) {
                            $timeout(function() {
                                scope.selectedNodeChanged(scope.selectedNode);
                            });
                        }
                    });
                });

                // 显示菜单回调
                tagtree.bind("show_contextmenu.jstree", function(node, x, y) {
                    $log.log("show_contextmenu after");
                });
            });
        }
    };
}]
);
