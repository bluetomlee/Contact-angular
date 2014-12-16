// epdApp_module
epdApp_module.filter('arriveTimerFormat', [function() {
		return function(input) {
			var s = input;
			var t;
			if(s > -1){
			    hour = Math.floor(s/3600);
			    min = Math.floor(s/60) % 60;
			    sec = s % 60;
			    day = parseInt(hour / 24);
			    if (day > 0) {
			        hour = hour - 24 * day;
			        t = day + "day " + hour + ":";
			    }
			    else t = hour + ":";   
			    if(min < 10){t += "0";}
			        t += min + ":";
			    if(sec < 10){t += "0";}
			        t += sec;
			}
			return t;
		};

	}
]);


/**
 * 成员消息过滤
 */
epdApp_module.filter('getContactContent', [function() {
    return function(input, key) {
        if(input && key) {
            var d = angular.fromJson(input);
            return d[key];
        }
    };
}]);

/**
 * 口令名称转换 text -> 文本
 */
epdApp_module.filter('getAutoreplyType', [function() {
	return function(input) {
		var typeOptions = {
			all: "所有",
			text: "文本",
			click: "菜单",
			image: "图片",
			voice: "语音",
			video: "视频",
			location: "地理位置",
			link: "链接",
			subscribe: "关注",
			unsubscribe: "取消关注",
			scan: "扫码"
		};
		if(input) {
			return typeOptions[input] || "无";
		} else {
			return "无";
		}
	};
}]);

/**
 * 设置成员属性列表
 */
epdApp_module.filter('getPropertyInfor',[function(){
	return function(contact, type) {
		if(type=='department'){
			return contact.deparentmentName;
		}else if(type=='publicAvatarPath'){
			return;
		}else{
			return contact[type];
		}
		
	}
}]);



/**
 * 设置成员属性 提示过滤
 */
epdApp_module.filter('getPropertyType',[function(){
	return function(label){
		var typeOptions = {
			publicAvatarPath: "自动获取",
			name: "必填",
			userId: "自动生成",
			department: "必填"
		};
		if(label){
			return typeOptions[label];
		}
	}
}]);


/**
 * 判断对象是否为空
 */
epdApp_module.filter('isObjectEmpty', function () {
    var bar;
    return function (obj) {
        for (bar in obj) {
            if (obj.hasOwnProperty(bar)) {
                return false;
            }
        }
        return true;
    };
});

/*处理声音和文件按时间排序*/

epdApp_module.filter('dateHandler', function () {
   return function(obj) {
       var materialDate = {
           year: {
               month: []
           }
       }
       for(var i = 0; i<obj.length; i++){
           var year = new Date(obj[i].createTime).getFullYear();
           var month = new Date(obj[i].createTime).getMonth()+1;
           if(!materialDate.year) {
               materialDate.year[month] = [];
           }else if(!materialDate.year[month]) {
               materialDate.year[month] = [];
           }
           var len = materialDate.year[month].length;
           materialDate.year[month][len] = obj[i];
       }
       delete materialDate.year.month;
       return materialDate.year;
   }
});

