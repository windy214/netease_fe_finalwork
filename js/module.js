//slider.js
function fadeIn(index) {
    var sliderSrc = [{
        url: 'http://open.163.com/',
        src: "img/banner1.jpg"
    }, {
        url: 'http://study.163.com/',
        src: "img/banner2.jpg"
    }, {
        url: 'http://www.icourse163.org/',
        src: "img/banner3.jpg"
    }]
    var obj = sliderSrc[index];
    var controllers = document.querySelectorAll('.m-slider-controller i');
    for(var i = 0, n = controllers.length; i < n; i++) {
        removeClass(controllers[i], 'chosen');
    }
    addClass(controllers[index], 'chosen');
    if(cssSupports('transition')) {
        document.querySelector('.m-slider-container img').style.cssText = "opacity:0";
        document.querySelector('.m-slider-container a').href = obj.url;
        document.querySelector('.m-slider-container img').src = obj.src;
        //延时执行确保css样式有变化过程
        setTimeout(function() {
            document.querySelector('.m-slider-container img').style.cssText = "opacity: 1;transition-property: opacity;transition-duration: .5s;transition-timing-function: ease-in-out;";
        }, 100)
    } else if(cssSupports('opacity')) {
        var i = 0;
        document.querySelector('.m-slider-container img').style.cssText = "opacity:" + i;
        document.querySelector('.m-slider-container a').href = obj.url;
        document.querySelector('.m-slider-container img').src = obj.src;
        var fadeoutHandler = setInterval(function() {
            if(i < 1) {
                i += 0.1;
                document.querySelector('.m-slider-container img').style.cssText = "opacity:" + i;
            } else {
                clearInterval(fadeoutHandler);
            }
        }, 50);
    } else {
        var i = 0;
        document.querySelector('.m-slider-container img').style.cssText = "filter:alpha(opacity=" + i + ")";
        document.querySelector('.m-slider-container a').href = obj.url;
        document.querySelector('.m-slider-container img').src = obj.src;
        var fadeoutHandler = setInterval(function() {
            if(i < 100) {
                i += 10;
                document.querySelector('.m-slider-container img').style.cssText = "filter:alpha(opacity=" + i + ")";
            } else {
                clearInterval(fadeoutHandler);
            }
        }, 50);
    }
}

//gridview.js
//获取课程列表
function getCourse(No, Size, Type) {
    ajax({
        url: 'http://study.163.com/webDev/couresByCategory.htm',
        method: 'get',
        data: {
            pageNo: No,
            psize: Size,
            type: Type
        },
        async: true
    }, function(data) {
        data = strToJson(data);
        //设置分页控件
        setPagination(data.pagination)
            //填充课程列表
        setGridviewContent(data.list);
    })
}

function setPagination(data) {
    var pageContainer = document.querySelector('.m-gridview-pages');
    /* 倒序生成页码 */
    var str = ""; //页码html字符串
    var item = ""; //单个页码
    var index = data.totlePageCount; //生成标签页码
    var pageIndex = data.pageIndex; //数据返回页码
    /* 判断index和选中页关系,生成相应页码项并拼接字符串 */
    for(; index >= 1; index--) {
        item = '<div class="m-pages-pagination';
        if(Math.abs(index - pageIndex) < 2 || index == data.totlePageCount || index == 1) {
            item += ' pagesnum';
            if(index == pageIndex) {
                item += ' chosen';
            }
            item += '"> ' + index + ' </div>';
        } else if((data.totlePageCount - pageIndex == 3 && pageIndex == index) ||
            (pageIndex <= 4 && index <= 4)) { //特殊情况连续页码显示,
            item += ' pagesnum';
            item += '"> ' + index + ' </div>';
        } else { //选中页与首尾差距超过2时显示'...'省略页码,并将标签页码跳到选中页码之后
            item += '"> ... </div>';
            if(index > pageIndex && index >= 4) {
                index = pageIndex + 2; //将标签页码跳到选中页码后一页+1 (循环中index--),实现中间页码省略效果
                if(index < 4) index = 4;
            } else if(index < pageIndex && index > 2) {
                index = 2;
            }
        }

        str = item + str;
    }
    pageContainer.innerHTML = '<div class="m-pages-previous"> <i></i> </div>' + str + '<div class="m-pages-next"> <i></i> </div>';

}

function setGridviewContent(data) {
    var str = "";
    for(var i = 0, n = data.length; i < n; i++) {
        //数据处理 先赋值后判断减少访问obj次数
        var price = data[i].price;
        price = price == 0 ? '  免费' : '¥ ' + price.toFixed(2);
        var categoryName = data[i].categoryName;
        categoryName = (!categoryName || categoryName == "null") ? '未分类' : categoryName;
        str +=
            '<div class="m-gridview-item"> \
            <img src="' + data[i].bigPhotoUrl + '" /> \
            <span class="name item-info">' + data[i].name + '</span> \
            <span class="org item-info">' + data[i].provider + '</span> \
            <i class="amount item-info">' + data[i].learnerCount + '</i> \
            <span class="price item-info">' + price + '</span> \
            <div class="coverlayer"> \
                <div class="coverlayer-body clearfix"> \
                    <img src="' + data[i].bigPhotoUrl + '" /> \
                    <span class="coverlayer-name">' + data[i].name + '</span> \
                    <span class="coverlayer-amount"><i></i>' + data[i].learnerCount + '人在学</span> \
                    <span class="coverlayer-provider">发布者：' + data[i].provider + '</span> \
                    <span class="coverlayer-category">分类： ' + categoryName + '</span> \
                </div> \
                <div class="coverlayer-footer"> \
                    <p class="coverlayer-description">' + data[i].description + '</p> \
                </div> \
            </div> \
        </div>';
    }
    document.querySelector('.m-gridview-content').innerHTML = str;
}