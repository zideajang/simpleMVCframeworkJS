// model view controller
;(function(w,d){
    var _viewElement = null,
        _defaultRoute = null,
        _rendered = false;

    var App = function(){
        this._routeMap = {};
    }

    App.prototype.AddRoute = function(controller,route,template){
        this._routeMap[route] = new routeObj(controller,route,template);
    }

    App.prototype.Initialize = function(){
        //创建更新视图的代理，获取视图的引用，然后将视图和 hash 关联
        //this 指向是 app
        var updateViewDelegate = updateView.bind(this);

        //获取 view 元素的引用
        _viewElement = d.querySelector('[view]');
        if(!_viewElement) return;

        // 设置默认路由
        _defaultRoute = this._routeMap[Object.getOwnPropertyNames(this._routeMap)[0]];

        //将更新视图代理和 hash change 之间建立联系
        w.onhashchange = updateViewDelegate;

        //调用更新视图代理
        updateViewDelegate();


    }

    function updateView(){
        //在路由中获取  route 名称 
        var pageHash = w.location.hash.replace('#',''),
        routeName = null,
        routeObj = null;
        routeName = pageHash.replace('/','');
        _rendered = false;

        // 遍历找到 route name 对应 routeObj
        routeObj = this._routeMap[routeName];
        if(!routeObj ){
            routeObj = _defaultRoute;
        }
        // 如果没有找到 route name 对应 routeObj 使用默认 routeObj

        loadTemplate(routeObj,_viewElement);

    }

    function loadTemplate(routeObject,viewElement)
    {
        var xmlhttp;
        if(window.XMLHttpRequest)
        {//for IE7+ chrome Firefox
            xmlhttp = new XMLHttpRequest();
        }else{//IE6 IE5 
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }

        xmlhttp.onreadystatechange = function(){
            if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
                //加载视图
                loadView(routeObj,viewElement,xmlhttp.responseText);
            }
        }

        xmlhttp.open('GET',routeObj.template,true);
        xmlhttp.send();
    }

    function loadView(routeObject,viewElement,viewHtml){
        //创建模型对象
        var model = {};
        //调用 controller 函数
        routeObject.controller(model);
        //替换 view html 使用model
        replaceTokens(viewElement,model);

        if(!_rendered)
        {
            viewElement.innerHTML = viewHtml;
            _rendered = true;
        }

    }

    function replaceTokens(viewHtml,model)
    {
        var modelProps = Object.getOwnPropertyNames(model);

        modelProps.forEach(function(element,index,array){
            viewHtml = viewHtml.replace('{{' + element + '}}',model[element]);
        });

        return viewHtml;
    }

    var routeObj  = function(c, r, t){
        this.controller = c;
        this.route = r;
        this.template = t;
    }

    w['App'] = new App();

})(window,document);

// 添加路由信息
// 创建更新视图的方法
// 根据 hash 改变来更新视图
// 遍历视图
