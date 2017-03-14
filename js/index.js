window.onload = function() {
    
    //页面刷新时根据窗口宽度改变布局
    if(document.body.clientWidth < 1206) {
        var narrowcss = document.createElement('link');
        narrowcss.rel = "stylesheet";
        narrowcss.type = "text/css";
        narrowcss.href = "css/narrow.css";
        //var str = '<link rel="stylesheet" type="text/css" href="css/narrow.css" />';
        //document.querySelector('head').appendChild(html2node(str));
        document.querySelector('head').appendChild(narrowcss);
    }
    var size = document.body.clientWidth >= 1206 ? 20 : 15;
    
    //获取cookie作状态检测
    var cookies = getcookie();
    //判断顶部广告栏设置
    if(cookies.hideAd) {
        hideHeaderAd();
    } else {
        addEvent(getElementsByClassName(document.body, 'nevershow')[0], 'click', function() {
            setCookie('hideAd', true);
            hideHeaderAd();
        });
    }
    //判断关注情况
    setFollowBtn();
    //关注按钮点击事件
    addEvent(getElementsByClassName(document.body, 'follow')[0], 'click', function() {
        var followState = isFollowed();
        switch(followState) {
            case 0:
                login();
                break;
            case 1:
            case 2:
                toggleFollow(followState);
                break;
        }
    });
    //slider图片轮播
    ! function() {
        //闭包保存index
        var srcIndex = 1;
        return ! function() {
            slider = setInterval(function() {
                fadeIn(srcIndex);
                srcIndex = (srcIndex + 1) % 3;
            }, 5000);
            //鼠标悬浮停止播放
            addEvent(document.querySelector('.m-slider-container img'), 'mouseover', function() {
                clearInterval(slider);
            });
            //鼠标移出重新播放
            addEvent(document.querySelector('.m-slider-container img'), 'mouseout', function() {
                slider = setInterval(function() {
                    fadeIn(srcIndex);
                    srcIndex = (srcIndex + 1) % 3;
                }, 5000);
            })
        }();
    }();
    //初始化获取课程列表
    getCourse(1, size, 10);
    //课程分类点击事件
    addEvent(getElementsByClassName(document.body, 'm-gridview-tab')[0], 'click', function(e) {
        var target = getTarget(e);
        var type = 0;
        var tabs = document.querySelectorAll('.m-gridview-tab div');
        if(target.innerHTML.trim() == "产品设计") {
            type = 10;
            addClass(tabs[0], 'tab-on');
            removeClass(tabs[1], 'tab-on');
        } else if(target.innerHTML.trim() == "编程语言") {
            type = 20;
            addClass(tabs[1], 'tab-on');
            removeClass(tabs[0], 'tab-on');
        }
        getCourse(1, size, type);
    });
    //分页控件点击事件
    addEvent(document.querySelector('.m-gridview-pages'), 'click', function(e) {
        var target = getTarget(e);
        //点击图标处理
        if(target.nodeName.toLowerCase() == "i") {
            target = target.parentNode;
        }
        var tab = document.querySelector('.m-gridview-tab .tab-on');
        var no = 1;
        var type = 0;
        if(tab.innerHTML.trim() == "产品设计") {
            type = 10;
        } else if(tab.innerHTML.trim() == "编程语言") {
            type = 20;
        }
        switch(target.className) {
            case "m-pages-previous":
                no = document.querySelector('.m-gridview-pages .chosen').innerHTML.trim() - 1;
                if(no < 1) return false;
                break;
            case "m-pages-next":
                no = document.querySelector('.m-gridview-pages .chosen').innerHTML.trim() - 0 + 1;
                var pagination = document.querySelector('.m-gridview-pages').childNodes;
                if(no > pagination[pagination.length - 2].innerHTML.trim()) return false;
                break;
            default:
                if(hasClass(target, 'pagesnum')) {
                    no = target.innerHTML.trim();
                } else {
                    return false;
                }
                break;
        }
        getCourse(no, size, type);
    });
    //点击图片播放视频
    addEvent(document.querySelector('.g-sider-video img'), 'click', function() {
        //创建弹窗对象,不定义var使变量全局有效
        modal = new Modal({
            content: '', //可传入节点和字符串
        });
        modal.show(
            '<div class="modal_videoplayer"> \
            <h3 class="modal_tittle"> \
                请观看下面的视频 \
            </h3> \
            <video controls="controls" width="889"> \
                <source src="//mov.bn.netease.com/open-movie/nos/mp4/2014/12/30/SADQ86F5S_shd.mp4" type="video/mp4"></source> \
                抱歉当前浏览器不支持 video直接播放 \
            </video> \
        </div>'
        );
    });

    //悬停1s显示浮层
    var lastTarget, coverTimer;
    addEvent(document.querySelector('.g-content'), 'mouseover', function(e) {
        var target = getTarget(e);
        stopBubble(e);
        while(target.className != "m-gridview-item") {
            target = target.parentNode;
            if(target.nodeName.toLowerCase() == "body") {
                break
            }
        }
        if(!lastTarget || target == lastTarget || lastTarget.nodeName.toLowerCase() == "body") {
            if(target.className == "m-gridview-item") {
                if(!coverTimer) { //防止重复设置延时器
                    coverTimer = setTimeout(function() {
                        addClass(target.querySelector('.coverlayer'), 'coveron');
                    }, 1000);
                }
            }
        } else {
            //移出当前目标重置延时器
            //removeClass(document.querySelector('.coveron'),'coveron');
            clearTimeout(coverTimer);
            coverTimer = "";
        }
        lastTarget = target;
    });
    addEvent(document.querySelector('.g-content'), 'mouseout', function(e) {

        var target = getTarget(e);
        stopBubble(e);
        //判断是否是悬浮在浮层上
        while(target.className != "m-gridview-item") {
            if(target.nodeName.toLowerCase() == "body") {
                //移出当前目标重置延时器
                removeClass(document.querySelector('.coveron'), 'coveron');
                clearTimeout(coverTimer);
                coverTimer = "";
                return false;
            }
            target = target.parentNode;
        }
        if(!target.querySelector('.coveron')) {
            removeClass(document.querySelector('.coveron'), 'coveron');
            clearTimeout(coverTimer);
            coverTimer = "";
        }
    });

    //获取最热排行
    loadHot();

}

function hideHeaderAd() {
    getElementsByClassName(document.body, 'g-header-top')[0].className = "g-header-top";
    getElementsByClassName(document.body, 'g-header-ad')[0].style.display = "none";
}

function login() {
    //创建弹窗对象,不定义var使变量全局有效
    modal = new Modal({
        content: '', //可传入节点和字符串
    });
    modal.show(
        '<div class="modal_login"> \
            <h3 class="modal_tittle"> \
                登录网易云课堂 \
            </h3> \
            <input type="text" id="account" placeholder="账号" /> \
            <input type="password" id="psw" placeholder="密码" /> \
            <span id="tip"></span> \
            <button id="loginBtn" onclick="logRequest()"></button>\
        </div>'
    );
}

function logRequest() {
    var account = document.getElementById("account").value.trim();
    var psw = document.getElementById("psw").value.trim();
    if(!account || !psw) {
        document.getElementById("tip").innerHTML = "请输入有效的账号密码!";
        return;
    }
    ajax({
        url: '//study.163.com/webDev/login.htm',
        data: {
            userName: MD5(account),
            password: MD5(psw)
        }
    }, function(data) {
        if(data == 1) {
            var datetime = new Date()
            setCookie('loginSuc', 1, datetime.setDate(datetime.getDate() + 30));
            modal.hide();
            toggleFollow(1);
        } else {
            document.getElementById("tip").innerHTML = "登录失败,请确认账号密码无误";
        }
    })
}

function loadHot() {
    ajax({
        url: '//study.163.com/webDev/hotcouresByCategory.htm',
        method: 'get',
        async: true,
    }, function(data) {
        var i = 0;
        var setHotRank = function(data) {
            data = strToJson(data);
            var str = "";
            for(var n = 0; n < 10; n++) {
                str +=
                    '<div class="m-ranking-item"> \
                    <img src="' + data[(i + n) % 20].middlePhotoUrl + '" /> \
                    <p> \
                        <span>' + data[(i + n) % 20].name + '</span> \
                        <i></i>' + data[(i + n) % 20].learnerCount + ' \
                    </p> \
                </div>';
            }
            document.querySelector('.g-sider-ranking .g-sider-container').innerHTML = str;
        };
        setHotRank(data);
        setInterval(function() {
            i = (i + 1) % 20;
            setHotRank(data);
        }, 5000);
    })
}

function isFollowed() {
    var cookies = getcookie();
    if(!cookies.loginSuc) {
        return 0;
    } else if(!cookies.followSuc) {
        return 1;
    } else {
        return 2;
    }
}

function setFollowBtn(state) {
    var followBtn = document.querySelector('.follow');
    switch(state || isFollowed()) {
        case 0:
        case 1:
            followBtn.className = "follow";
            followBtn.innerHTML = '<i class="icon"></i> 关注';
            break;
        case 2:
            followBtn.className = "follow ed";
            followBtn.innerHTML = '<i class="icon"></i> 已关注 <i>|</i> <span>取消</span>';
            break;
    }
}
// 改变关注状态
function toggleFollow(state) {
    if(!state) {
        state = isFollowed();
    }
    switch(state) {
        case 1:
            ajax({
                method: 'get',
                url: '//study.163.com/webDev/attention.htm'
            }, function(data) {
                if(data == 1) setCookie('followSuc', 1);
                setFollowBtn(2);
            })
            break;
        case 2:
            setCookie('followSuc', 0, new Date());
            setFollowBtn(1);
            break;
    }
}