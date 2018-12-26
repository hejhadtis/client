//======================================================================================================================
//重写$.ajax
(function ($) {
    //备份原来的ajax方法
    var _ajax = $.ajax;

    //重写ajax方法
    $.ajax = function (opt) {
        if (!$.isPlainObject(opt)) {
            throw new Error("opt is not a Object.");
        }

        if ($.isEmptyObject(opt)) {
            throw new Error("opt must not be empty.");
        }

        //是否有加载蒙版
        //console.log(Object.prototype.toString.call(opt.haveLoadingMask) === "[object Boolean]");
        var haveLoadingMask = false;//默认值
        if (Object.prototype.toString.call(opt.haveLoadingMask) === "[object Boolean]") {
            haveLoadingMask = opt.haveLoadingMask;
        }

        //是否增强success回调
        var intensifySuccessCallback = true;//默认值
        if (Object.prototype.toString.call(opt.intensifySuccessCallback) === "[object Boolean]") {
            intensifySuccessCallback = opt.intensifySuccessCallback;
        }

        //备份opt中error和success方法
        var fn = {
            beforeSend: function (xhr, settings) {
            }
            , success: function (data, textStatus, xhr) {
            }
            , complete: function (xhr, textStatus) {
            }
            , error: function (xhr, textStatus, errorThrown) {
            }
        };
        if (opt.success) {
            fn.success = opt.success;
        }
        if (opt.beforeSend) {
            fn.beforeSend = opt.beforeSend;
        }
        if (opt.complete) {
            fn.complete = opt.complete;
        }
        if (opt.error) {
            fn.error = opt.error;
        }

        //设置超时时间
        if (!opt.timeout) {
            /*opt.timeout = Hredu.ajaxTimeout;*/
        }

        //扩展增强处理
        var _opt = $.extend(opt, {
            beforeSend: function (xhr, settings) {
                //提交前回调方法
                //console.log("beforeSend");
                if (haveLoadingMask) {
                    Comm.loadingShow();
                }
                fn.beforeSend(xhr, settings);
            },
            success: function (data, textStatus, xhr) {
                //成功回调方法增强处理
                //console.log("success");
                if (haveLoadingMask) {
                    Comm.loadingHide();
                }
                // if (!Comm.checkAjaxResponseHeaderHandler(xhr)) {
                //     return;
                // }
                // if (intensifySuccessCallback) {
                //     if (!Comm.checkAjaxSuccessData(data)) {
                //         return;
                //     }
                // }
                fn.success(data, textStatus, xhr);
            },
            error: function (xhr, textStatus, errorThrown) {
                //错误方法增强处理
                //console.log("error");
                if (haveLoadingMask) {
                    Comm.loadingHide();
                }
                if (!Comm.checkAjaxResponseHeaderHandler(xhr)) {
                    return;
                }
                fn.error(xhr, textStatus, errorThrown);
            },
            complete: function (xhr, textStatus) {
                //控制台菜单占满左侧高度
                // consoleMenuHeightChangeHandler();
                throttle(consoleMenuHeightChangeHandler, 100, 300)();
                // Comm.scrollToTop();

                //请求完成后回调函数 (请求成功或失败之后均调用)。
                if (haveLoadingMask) {
                    Comm.loadingHide();
                }
                if (!Comm.checkAjaxResponseHeaderHandler(xhr)) {
                    return;
                }
                //console.log("complete");
                fn.complete(xhr, textStatus);
            }
        });
        return _ajax(_opt);
    };
})(jQuery);

//======================================================================================================================
var Comm = Comm || {};
;(function (comm) {
    /** 弹框默认参数 */
    var defaultOpts = {
        dialogClass: ""
        , title: ""
        , width: "350px"     //像素
        , closeText: "关闭"
        , buttons: []        //{text:"关闭", isClose:false, click:function(){}, btnClass:""}
        , maskNum: 1040 //模态框遮罩层z-index默认值
        , hideZindex:1040 //模态框隐藏时遮罩层z-index
        , displayZindex:1060 //模态框显示区域z-index
        , showZindex:1050 //模态框显示时遮罩层z-index
    };

    /** 弹框类型 */
    var _typeEnum = {
        info: "infoModal1483175035175"
        , warn: "warnModal1483175035175"
        , error: "errorModal1483175035175"
        , confirm: "confirmModal1483175035175"
        , custom: "customModal1483175035175"
    };

    /**
     * <p>
     * Title:   _haveButtons
     * <p>
     * Description: 判断是否是正确的按钮参数
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月02日
     *
     * @param {*} buttons 按钮参数对象
     * @return {boolean} true:有正确的按钮参数，否则无者却的按钮参数
     */
    function _haveButtons(buttons) {
        return !($.isEmptyObject(buttons) || ($.isArray(buttons) && buttons.length <= 0));
    }

    /**
     * <p>
     * Title:   _dialogHaveBtnHandler
     * <p>
     * Description: 处理弹框的按钮
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月02日
     *
     * @param {string} id 弹框的ID
     * @param {Array} buttonArr 按钮数组 e.g. [{text:"关闭", click:function(){}, isClose:false, btnClass:""}]
     */
    function _dialogHaveBtnHandler(id, buttonArr) {
        var style = "behavior: url(\'" + Hredu.basePath + "/plugin/jianrong/apie.htc\');";
        // var $footer = $("#"+id).find(".modal-footer").remove().end()//删除以存在的按钮
        //     .find(".modal-content").append('<div class="modal-footer"></div>') //添加按钮容器
        //     .find(".modal-footer"); //找到按钮容器
        var $footer = $("#" + id).find(".modal-footer").empty();

        $.each(buttonArr, function (index) {
            if (!$.isPlainObject(this)) {
                return false;
            }
            // $footer.append("<button mybtn='" + index + "' type='button'></button>");//添加按钮
            // var $btn = $footer.find("button[mybtn='" + index + "']").addClass("btn");
            $footer.append(Util.sprintf('<button data-index="%s" type="button"></button>', index));
            var $btn = $footer.find(Util.sprintf("button[data-index='%s']", index)).addClass("btn");
            if (!this.isClose) {
                $btn.attr("style", style).html(this.text);
            } else {
                $btn.attr({"style": style, "data-dismiss": "modal"}).html(this.text);
            }
            if (!this.btnClass) {
                // $btn.addClass("btn-default");
                if (!this.isClose) {
                    $btn.addClass("btn-sure");
                } else {
                    $btn.addClass("btn-cancel");
                }
            } else {
                $btn.addClass(this.btnClass);
            }
            if ($.isFunction(this.click) && !this.isClose) {
                $btn.unbind("click").bind("click", this.click);
            }
        });
    }


    /**
     * <p>
     * Title:   _dialogInit
     * <p>
     * Description: 初始化弹框
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月02日
     *
     * @param {string} id 弹框ID/弹框类型 _typeEnum
     * @param {object} opts 参数
     * @return {jQuery} 弹框对象
     */
    function _dialogInit(id, opts) {
        //合并参数
        if ($.isPlainObject(opts)) {
            opts = $.extend({}, defaultOpts, opts);
        } else {
            opts = defaultOpts;
        }

        //处理按钮
        var buttonArr = opts.buttons;
        if (_haveButtons(buttonArr)) {
            _dialogHaveBtnHandler.call(this, id, buttonArr);
        }// end of "if (_haveButtons(opts.buttons)) {"

        //设置显示z-index
        // var hide_zindex = defaultOpts.maskNum;//1040
        // var display_zindex = hide_zindex + 10;//1050
        // var show_zindex = hide_zindex;//1040
        // var mask_zindex = opts.maskNum;
        // if ($.isNumeric(mask_zindex) && mask_zindex > 0) {
        //     mask_zindex = parseInt(mask_zindex, 10);
        //     hide_zindex = mask_zindex;
        //     show_zindex = hide_zindex;
        //     display_zindex = hide_zindex + 10;
        // }

        var contentStyle = {"margin": "0 auto", "width": opts.width, "behavior": "url(\'" + Hredu.basePath + "/plugin/jianrong/apie.htc\')"};
        return $("#" + id).modal({keyboard: false, backdrop: "static", show: false})
            .find(".modal-content").css(contentStyle)
            // .find(".close").attr("title", opts.closeText).end()
            .find(".modal-title").html(opts.title).end()
            // .find(".modal-body").html("").end()
            .find(".hint-box").html("").end()
            .end()
            .unbind("show.bs.modal").bind("show.bs.modal", function () {
                $(this).css("overflow", "hidden") // 防止出现滚动条，出现的话，你会把滚动条一起拖着走的
                    .find(".modal-content")
                    .draggabilly({handle: ".modal-header", containment: "div#" + id})//拖拽
                    .removeAttr("style").css(contentStyle);//关闭后再次显示居中
                Util.centerModals.call(this, "#" + id);
            })
            .css({zIndex: opts.displayZindex})
            // .css({zIndex: display_zindex})
            .unbind("hide.bs.modal").bind('hide.bs.modal', function () {
                // $(".modal-backdrop").css("z-index", hide_zindex);
                $(".modal-backdrop").css("z-index", opts.hideZindex);
                $("body").css({"padding-right": 0});
                if (_haveButtons(buttonArr)) {
                    $.each(buttonArr, function () {
                        if (this.isClose && $.isFunction(this.click)) {
                            this.click();
                            return false;
                        }
                    });
                }
            })
            .unbind("shown.bs.modal").bind("shown.bs.modal", function () {
                // $(".modal-backdrop").css("z-index", show_zindex);
                $(".modal-backdrop").css("z-index", opts.showZindex);
            })
            .unbind("hidden.bs.modal").bind("hidden.bs.modal", function () {
                // $(this).css({"z-index":"auto"});
                $("body").css({"padding-right": 0});
            })
            ;
    }

    /**
     * <p>
     * Title:   _info
     * <p>
     * Description: 提示弹框
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月02日
     *
     * @param {*} msg 弹框内容
     * @param {number} [maskNum] 弹框遮罩层z-index高度,该参数可选
     * @param {object} [copts]
     * @param {function} [closeHandler]
     */
    function _info(msg, maskNum, copts, closeHandler) {
        if (!$.isFunction(closeHandler)) {
            closeHandler = function () {
            };
        }
        var opts = {title: "提示", buttons: [{text: "关<i></i>闭", btnClass: "btn-cancel", isClose: true, click: closeHandler}]};
        if ($.isPlainObject(copts)) {
            opts = $.extend({}, opts, copts);
        }
        if (maskNum && $.isNumeric(maskNum)) {
            opts = $.extend({}, opts, {maskNum: maskNum});
        }
        _dialogInit(_typeEnum.info, opts).find("div.hint-box").html(msg || "").end().modal("show");
    }

    /**
     * <p>
     * Title:   _error
     * <p>
     * Description: 错误弹框
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月02日
     *
     * @param {*}msg 弹框内容
     * @param {number} [maskNum] 弹框遮罩层z-index高度,该参数可选
     */
    function _error(msg, maskNum) {
        var opts = {title: "错误", buttons: [{text: "关<i></i>闭", btnClass: "btn-cancel", isClose: true}]};
        if (maskNum && $.isNumeric(maskNum)) {
            opts = $.extend({}, opts, {maskNum: maskNum});
        }
        _dialogInit(_typeEnum.error, opts).find("div.hint-box").html(msg || "").end().modal("show");
    }

    /**
     * <p>
     * Title:   _warn
     * <p>
     * Description: 提示弹框
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月02日
     *
     * @param {*} msg 弹框内容
     * @param {number} [maskNum] 弹框遮罩层z-index高度,该参数可选
     * @param {object} [copts]
     * @param {function} [closeHandler]
     */
    function _warn(msg, maskNum, copts, closeHandler) {
        if (!$.isFunction(closeHandler)) {
            closeHandler = function () {
            };
        }
        // var opts = {title: "警告", buttons: [{text: "关<i></i>闭", btnClass: "btn-cancel", isClose: true, click: closeHandler}]};
        var opts = {title: "提示", buttons: [{text: "关<i></i>闭", btnClass: "btn-cancel", isClose: true, click: closeHandler}]};
        if ($.isPlainObject(copts)) {
            opts = $.extend({}, opts, copts);
        }
        if (maskNum && $.isNumeric(maskNum)) {
            opts = $.extend({}, opts, {maskNum: maskNum});
        }
        _dialogInit(_typeEnum.warn, opts).find("div.hint-box").html(msg || "").end().modal("show");
    }

    /**
     * <p>
     * Title:   _confirm
     * <p>
     * Description: 确认弹框
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月02日
     *
     * @param msg 弹框内容
     * @param sureFunc 确认后触发的方法
     * @param {number} [maskNum] 弹框遮罩层z-index高度,该参数可选
     * @param {object} [copts]
     */
    function _confirm(msg, sureFunc, maskNum, copts) {
        var opts = {
            title: "确定",
            buttons: [{text: "确<i></i>定", click: sureFunc, btnClass: "btn-sure"}, {text: "关<i></i>闭", btnClass: "btn-cancel", isClose: true}]
        };
        if ($.isPlainObject(copts)) {
            opts = $.extend({}, opts, copts);
        }
        if (maskNum && $.isNumeric(maskNum)) {
            opts = $.extend({}, opts, {maskNum: maskNum});
        }
        _dialogInit(_typeEnum.confirm, opts).find("div.hint-box").html(msg || "").end().modal("show");
    }

    /**
     * <p>
     * Title:   _custom
     * <p>
     * Description: 自定义弹框
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月02日
     *
     * @param msg 弹框内容
     * @param opts 弹框参数
     */
    function _custom(msg, opts) {
        var defOpts = {title: "自定义", buttons: [{text: "关闭", isClose: true}]};
        opts = $.isPlainObject(opts) ? $.extend({}, defOpts, opts) : defOpts;
        _dialogInit(_typeEnum.custom, opts).find("div.modal-body").html(msg || "").end().modal("show");
    }

    /**
     * <p>
     * Title:        _hide
     * <p>
     * Description:  隐藏弹框
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月02日
     *
     * @param type 弹框类型 _typeEnum
     */
    function _hide(type) {
        $("#" + type).modal("hide");
    }

    /**
     * <p>
     * Title:        _initDropdown
     * <p>
     * Description:  初始化下拉框
     *
     * e.g. html写法：
     * <div class="dropdown">
     *      <button class="btn btn-block dropdown-toggle clearfix" type="button" id="custom_id" data-toggle="dropdown">
     *          <span class="default-val" val="-1">全部</span>
     *          <span class="dropdown-caret"></span>
     *      </button>
     *      <ul class="dropdown-menu" role="menu" aria-labelledby="custom_id">
     *          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);" val="-1">全部</a></li>
     *          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);" val="1">有效</a></li>
     *          <li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);" val="0">无效</a></li>
     *      </ul>
     * </div>
     *
     * js初始化(不带默认值)：
     *      Comm.initDropdown("custom_id");
     *
     * js初始化(带默认值)：
     *      Comm.initDropdown("custom_id", "1");
     *
     * js自定义事件：
     *     $("#custom_id").bind("dropdown.change", function(){
     *          //do something
     *     })
     *     或者：
     *     Comm.initDropdown("custom_id").bind("dropdown.change", funciton(){
      *         //do something
      *    });
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月02日
     *
     * @param id 下拉框的ID
     * @param defaultVal 初始化后显示的默认值
     * @param maxHeight 下拉框最大高度，超过后滚动
     */
    function _initDropdown(id, defaultVal, maxHeight) {
        var $dropdown = $("#" + id);
        if ($dropdown.length <= 0) {
            throw new Error("dropdown 'div#" + id + "' no exists.");
        }
        var $default = $dropdown.find("span.default-val");
        if ($default.length <= 0) {
            throw new Error("span.default-val no exists in dropdown 'div#" + id + "'.");
        }
        var $this;
        var hasSetDefaultVal = false;
        defaultVal = "" + defaultVal;
        $dropdown.parent().find("ul[aria-labelledby='" + id + "']").find("a").each(function () {
            $this = $(this);
            //设置默认值
            if (!hasSetDefaultVal && defaultVal && $this.attr("val") === defaultVal) {
                $default.html($this.html()).attr("val", defaultVal);
                hasSetDefaultVal = true;
            }

            //绑定点击事件
            var lastDefault;
            $(this).unbind("click").bind("click", function (e) {
                //e.stopPropagation();
                //阻止a标签的锚点
                e.preventDefault();
                lastDefault = $default.attr("val");
                //改变span.default-val的值
                $default.html($(this).html()).attr("val", $(this).attr("val"));
                //触发自定义change事件：
                if (lastDefault && lastDefault !== $(this).attr("val")) {
                    //$dropdown.triggerHandler("dropdown.change");
                    $dropdown.trigger("dropdown.change");//触发自定义事件dropdown.change
                }
            });
        });

        if (!hasSetDefaultVal) {
            if (!defaultVal || "undefined" === defaultVal) {
                defaultVal = "";
            }
            $default.html("").attr("val", defaultVal);
        }

        //add 20170505 by fangtl S
        maxHeight = $.isNumeric(maxHeight) ? maxHeight : 300;
        $dropdown.parent().unbind("show.bs.dropdown").bind("show.bs.dropdown", function () {
            var $ul = $(this).find("ul[aria-labelledby='" + id + "']");
            var ulHeight = $ul.height();
            //console.log(ulHeight);
            if (ulHeight > maxHeight) {
                $ul.css({"max-height": maxHeight + "px", "overflow-y": "scroll"});
            }
        });
        //$dropdown.parent().unbind("shown.bs.dropdown").bind("shown.bs.dropdown", function(){ alert("shown.bs.dropdown"); });
        //$dropdown.parent().unbind("hide.bs.dropdown").bind("hide.bs.dropdown", function(){ alert("hide.bs.dropdown"); });
        //$dropdown.parent().unbind("hidden.bs.dropdown").bind("hidden.bs.dropdown", function(){ alert("hidden.bs.dropdown"); });
        //add 20170505 by fangtl E
        return $dropdown;
    }

    /**
     * 初始化下拉框
     * @param url
     * @param id
     * @private
     */
    function _initDropdownMenuFunc(url,data,id,opt) {
        var p = $.isPlainObject(opt) ? opt : {};
        var val = p.val,name = p.name;
        $.ajax({
            type:"POST",
            dataType:"json",
            url:url,
            data:data,
            success:function (result) {
                var item=result.rows,
                    parent=$("#"+id).parent();
                if(item.length == 0){
                    item.push({sysroleid:1,name:"管理员"});
                    item.push({sysroleid:4,name:"学员"});
                }else {
                    if(result.sysuserid != 1){
                        item.push({sysroleid:1,name:"管理员"});
                        item.push({sysroleid:4,name:"学员"});
                    }
                }
                var html='<button class="btn btn-block dropdown-toggle clearfix" type="button" id="'+id+'" data-toggle="dropdown">\n' +
                    '<span class="default-val" val="'+item[0].sysroleid+'">'+item[0].name+'</span>\n' +
                    '<span class="dropdown-caret"></span>\n' +
                    '</button><ul class="dropdown-menu" role="menu" aria-labelledby="'+id+'">';
                for(var i=0;i<item.length;i++){
                    html+='<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);" val="'+item[i].sysroleid+'">'+item[i].name+'</a></li>';
                }
                html+="</ul>";
                parent.empty().append(html);
                if(!val){
                    val = item[0].sysroleid;
                }
                _initDropdown(id,val);
                /*else {
                var html='<button class="btn btn-block dropdown-toggle clearfix" type="button" id="'+id+'" data-toggle="dropdown">\n' +
                        '<span class="default-val" val="'+val+'">'+name+'</span>\n' +
                        '<span class="dropdown-caret"></span>\n' +
                        '</button><ul class="dropdown-menu" role="menu" aria-labelledby="'+id+'">' +
                        '<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);" val="'+val+'">'+name+'</a></li></ul></ul>';
                parent.empty().append(html);
                _initDropdown(id,val);
            }*/
            }
        })
    }

    /**
     * <p>
     * Title:        _getDropdownVal
     * <p>
     * Description:  获取下拉框当前的显示值
     * e.g. var currentValue = Comm.getDropdownVal("custom_dropdown_id");
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月05日
     *
     * @param id 下拉框的ID
     * @return 当前显示值
     */
    function _getDropdownVal(id) {
        var $default = $("#" + id).find("span.default-val");
        if ($default.length <= 0) {
            throw new Error("span.default-val no exists in dropdown 'div#" + id + "'.");
        }
        return $default.attr("val");
    }

    /**
     * <p>
     * Title:        _getDropdownText
     * <p>
     * Description:  获取下拉框当前的显示内容
     * e.g. var currentValue = Comm.getDropdownText("custom_dropdown_id");
     *
     * @author      wangyx
     * @date         2017年05月15日
     *
     * @param id 下拉框的ID
     * @return 当前显示内容
     */
    function _getDropdownText(id) {
        var $default = $("#" + id).find("span.default-val");
        if ($default.length <= 0) {
            throw new Error("span.default-val no exists in dropdown 'div#" + id + "'.");
        }
        return $default.text();
    }

    /**
     * <p>
     * Title:         _initModal
     * <p>
     * Description:  初始化模态弹框
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月09日
     *
     * @param {string} id 模态框ID
     * @param {boolean} [isShow] true:初始化后显示弹框，否则不显示
     * @param {boolean} [isDragable] true:弹框能够拖动，否则不能拖动
     * @param {function} [hideFunc] 模态框隐藏时的触发函数
     * @param hideZindex 模态框隐藏时遮罩层z-index
     * @param displayZindex 模态框显示区域z-index
     * @param showZindex 模态框显示时遮罩层z-index
     * @return {jQuery} 模态框对象
     */
    function _initModal(id, isShow, isDragable, hideFunc, hideZindex, displayZindex, showZindex, minHeight) {
        var $elem = $("#" + id);
        if ($elem.length <= 0) {
            throw new Error("'div#" + id + "' no exists.");
        }

        if (!$.isFunction(hideFunc)) {
            hideFunc = function () {};
        }

        var hide_zindex = hideZindex, display_zindex = displayZindex, show_zindex = showZindex;
        if (!$.isNumeric(hide_zindex) || hide_zindex <= 0) {
            hide_zindex = defaultOpts.hideZindex;
        }
        if (!$.isNumeric(show_zindex) || show_zindex <= 0) {
            // show_zindex = parseInt(hide_zindex, 10) + 10;
            // show_zindex = defaultOpts.showZindex;
            show_zindex = 1041;
        }
        if (!$.isNumeric(display_zindex) || display_zindex <= 0) {
            // display_zindex = parseInt(show_zindex, 10) + 10;
            // display_zindex = defaultOpts.displayZindex;
            display_zindex = 1050;
        }

        var $modal = $elem.modal({keyboard: false, backdrop: "static", show: false})
            .unbind("show.bs.modal").bind("show.bs.modal", function () {
                Util.centerModals.call(this, "#" + id);
                $(this).find("div.modal-content").css({"min-height":minHeight});
            })
            .css({zIndex : display_zindex})
            .unbind("shown.bs.modal").bind("shown.bs.modal", function(){
                if (showZindex > 0) {
                    $(".modal-backdrop").css("z-index", show_zindex);
                }
            })
            .unbind("hidden.bs.modal").bind("hidden.bs.modal", function () {
                $(this).find("div.modal-content").attr("style", "");
                // $(this).css({"z-index":"auto"});
                $("body").css({"padding-right": 0});
            })//关闭弹框后，清除div.modal-content上的style属性;
            .unbind("hide.bs.modal").bind('hide.bs.modal', function () {
                $("body").css({"padding-right": 0});
                hideFunc.call(this);
                if (hideZindex > 0) {
                    $(".modal-backdrop").css("z-index", hide_zindex);
                }
            });

        // if (displayZindex > 0) {
        //     $modal.css({zIndex : display_zindex});
        // }

        if (isDragable && isDragable === true) {
            //$modal.draggabilly({handle: ".modal-header", containment: "div#"+id});
            $modal.find("div.modal-content").draggabilly({handle: ".modal-header", containment: "div#" + id});
        }

        if (isShow && isShow === true) {
            $modal.modal("show");
        }

        return $modal;
    }

    /**
     * <p>
     * Title:       _initFileInput
     * <p>
     * Description: 初始化自定义文件上传input框
     * e.g.
     * html：
     *  <button type="button" id="custom_id" class="btn btn-select-file border-1px-e0e0e0">请选择文件</button>
     *  <span class="file-name" id="custom_id_name_display">请选择文件</span>
     *  <input type="file" class="hidden" id="custom_id_file_input">
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月10日
     */
    function _initFileInput(id) {
        //点击按钮触发input[type='file']的弹出框
        $("#" + id).on("click", function () {
            $("#" + id + "_file_input").click();
        });
        //change事件，改变文件名
        $("#" + id + "_file_input").on("change", function () {
            var fname = $(this).val();
            var index = fname.lastIndexOf("/");
            index = index < 0 ? fname.lastIndexOf("\\") : index;
            fname = index >= 0 ? fname.substr(index + 1) : fname;
            $("#" + id + "_name_display").html(fname);
        });
    }

    /**
     * <p>
     * Title:        _isValidImage
     * <p>
     * Description:  检查是否支持该图片(fileName)
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月15日
     *
     * @param {String} fileName 图片名或图片的相对路径或图片绝对路径
     * @param {Array} [filenameExtensionArray] 支持的文件扩展名数组，数组中的元素必须是字符串。该参数可省虐(默认支持类型 "jpg", "jpeg", "png", "gif")
     * @returns {boolean} true:支持该类型图片，false:不支持该类型图片
     */
    function _isValidImage(fileName, filenameExtensionArray) {
        if (!filenameExtensionArray || !$.isArray(filenameExtensionArray)) {
            filenameExtensionArray = ["jpg", "jpeg", "png", "gif"];
        }
        if (!Util.isValidFile(fileName, filenameExtensionArray)) {
            _info("支持图片的格式为：" + filenameExtensionArray.join("、"), $("#mce-modal-block").css("z-index"));
            return false;
        }
        return true;
    }

    /**
     * <p>
     * Title:        _checkAjaxSuccessData
     * <p>
     * Description:  检查Ajax请求成功后的数据
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月15日
     *
     * @param ajaxSuccessData Ajax请求成功后台返回的JSON数据
     * @param [dialogZIndex] 提示弹框遮罩层的高度(z-index值)，该参数可省略
     * @return {boolean} true:数据校核成功，否则校核失败
     */
    function _checkAjaxSuccessData(ajaxSuccessData, dialogZIndex) {
        if (!ajaxSuccessData) {
            _error("发生了错误", dialogZIndex);
            return false;
        }
        // var status = ajaxSuccessData.status;
        // if (!status) {
        //     console.log("------数据错误:");
        //     console.log(ajaxSuccessData);
        //     console.log(status);
        //     console.log("--------------");
        //     return false;
        // }
        // if ((""+(status.code)) !== "0") {
        //     _warn(status.msg, dialogZIndex);
        //     return false;
        // }
        // var data = ajaxSuccessData.data;
        // if (!data) {
        //     console.log("------数据错误:");
        //     console.log(ajaxSuccessData);
        //     console.log(data);
        //     console.log("--------------");
        //     return false;
        // }
        return true;
    }

    function _ajaxFail(xhr, textStatus, errorThrown) {
        if (xhr.readyState == 0) {
            return;
        }
        //add 20170330 by fangtl S
        var uri = xhr.getResponseHeader("sessiontimeout");
        if (!Util.isBlankString(uri)) {
            _checkAjaxResponseHeaderHandler(xhr);
            return;
        }
        //add 20170330 by fangtl E
        if (errorThrown === "timeout") {
            _error("请求超时，请稍后再试。");
            return;
        }
        _error("服务器繁忙，请稍后再试。");
    }

    function _bootstrapTableResponseHandler(result) {
        if (!_checkAjaxSuccessData(result)) {
            return {};
        }
        return {total: result.data.total, rows: result.data.rows};
    }

    /**
     * <p>
     * Title:        _loadingCenter
     * <p>
     * Description:  加载框居中
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年02月24日
     */
    function _loadingCenter() {
        $("#loadingDlg1483175035175").each(function () {
            var $clone = $(this).clone().css('display', 'none').appendTo('body');
            var top = Math.round(($(window).height() - $clone.height()) / 2);
            $clone.remove();
            $(this).find("div.loading-img-box").css("margin-top", top);
        });
    }

    function _loadingCenter2() {
        $("#loadingDlg148317503517522").each(function () {
            var $clone = $(this).clone().css('display', 'none').appendTo('body');
            var top = Math.round(($(window).height() - $clone.height()) / 2);
            $clone.remove();
            $(this).find("div.loading-img-box").css("margin-top", top);
        });
    }

    var _loadingIsShow = false;
    var _loadingIsShow2 = false;

    /**
     * <p>
     * Title:        _loadingShow
     * <p>
     * Description:  加载框显示
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年02月24日
     */
    function _loadingShow() {
        if (_loadingIsShow) {
            return;
        }
        $("#loadingDlg1483175035175").removeClass("hidden");
        $("body").css({"overflow": "hidden"});
        _loadingCenter();
        $(window).unbind("resize", _loadingCenter).bind("resize", _loadingCenter);
        _loadingIsShow = true;
    }

    /**
     * <p>
     * Title:        _loadingHide
     * <p>
     * Description:  加载框隐藏
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年02月24日
     */
    function _loadingHide() {
        if (!_loadingIsShow) {
            return;
        }
        $("#loadingDlg1483175035175").addClass("hidden");
        if ($("body").css("overflow") === "hidden") {
            $("body").css("overflow", "");
        }
        $(window).unbind("resize", _loadingCenter);
        _loadingIsShow = false;
    }

    //loadingDlg148317503517522
    function _loadingShow2() {
        if (_loadingIsShow2) {
            return;
        }
        $("#loadingDlg148317503517522").removeClass("hidden");
        $("body").css({"overflow": "hidden"});
        _loadingCenter2();
        $(window).unbind("resize", _loadingCenter2).bind("resize", _loadingCenter2);
        _loadingIsShow2 = true;
    }

    function _loadingHide2() {
        if (!_loadingIsShow2) {
            return;
        }
        $("#loadingDlg148317503517522").addClass("hidden");
        if ($("body").css("overflow") === "hidden") {
            $("body").css("overflow", "");
        }
        $(window).unbind("resize", _loadingCenter2);
        _loadingIsShow2 = false;
    }

    /**
     * <p>
     * Title:        _isValidExcel
     * <p>
     * Description:  检查是否支持该excel文件(fileName)
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年01月15日
     *
     * @param {String} fileName excel文件名或excel文件的相对路径或excel文件绝对路径
     * @param {Array} [filenameExtensionArray] 支持的文件扩展名数组，数组中的元素必须是字符串。该参数可省虐(默认支持类型 "xls", "xlsx")
     * @returns {boolean} true:支持该类型excel，false:不支持该类型excel
     */
    function _isValidExcel(fileName, filenameExtensionArray) {
        if (!filenameExtensionArray || !$.isArray(filenameExtensionArray)) {
            filenameExtensionArray = ["xls", "xlsx"];
        }
        if (!Util.isValidFile(fileName, filenameExtensionArray)) {
            _warn("支持excel文件的格式为：" + filenameExtensionArray.join("、"), $("#mce-modal-block").css("z-index"));
            return false;
        }
        return true;
    }


    var _timeoutModalIsShow = false;

    /**
     * <p>
     * Title:        _checkAjaxResponseHeaderHandler
     * <p>
     * Description:  session超时的处理
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年03月30日
     *
     * @param xhr XMLHttpRequest对象
     * @returns {boolean} true 校核通过，校核失败
     * @private
     */
    function _checkAjaxResponseHeaderHandler(xhr) {
        //console.log(xhr);
        if (!$.isPlainObject(xhr)) {
            return true;
        }
        if (_timeoutModalIsShow) {
            return true;
        }

        var uri = xhr.getResponseHeader("sessiontimeout");
        if(!uri) {
            uri = xhr.getResponseHeader("Sessiontimeout");
        }
        /*if (Util.isBlankString(uri)) {
            return true;
        }*/

        var __closeHandler = function () {
            window.location.href = window.location.origin + uri;
        };
        // _custom("由于长时间没有操作自动退出系统。请重新登录到服务器。", {
        //      title: "警告"
        //     ,buttons:[//
        //         {text: "关闭", isClose: true, click: __closeHandler}//
        //     ]//
        // });
        _warn("由于长时间没有操作自动退出系统。请重新登录到服务器。", null, null, __closeHandler);
        _timeoutModalIsShow = true;
        return false;
    }

    /**
     * 校核文件名长度
     *
     * @param {string} fname
     * @param {*} [maxLength]
     * @returns {boolean}
     * @private
     */
    function _isValidFilenameLength(fname, maxLength) {
        if (!fname) {
            _info("请选择文件");
            return false;
        }
        maxLength = Util.isNum(maxLength) ? parseInt(maxLength, 10) : 254;
        maxLength = maxLength <= 0 ? 254 : maxLength;

        var fnameLength = fname.length;
        if (fnameLength > maxLength) {
            _info("文件名长度[" + fnameLength + "]超过最大长度[" + maxLength + "]");
            return false;
        }

        return true;
    }

    /**
     * <p>
     * Title:        _limitInputMaxLength
     * <p>
     * Description:  验证输入文本长度
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年03月30日
     *
     * @param val 校对文本
     * @param maxLength 长度
     * @param type 类型
     * @returns {boolean} true 校核通过，校核失败
     * @private
     */
    function _limitInputMaxLength(val, maxLength, type) {
        if (!val) {
            val = "";
        }

        if (Util.isNum(maxLength)) {
            maxLength = parseInt(maxLength, 10);
        } else {
            throw new Error(maxLength + "is not a number.");
        }

        type = type || "";

        var valLength = val.length;
        if (valLength > maxLength) {
            _info("\"" + type + "\"最多可以输入" + maxLength + "个字");
            return false;
        }
        return true;
    }


    function _inputFocusBlur(selecter) {
        var $box = $(selecter);
        $box.on("focus", "input[data-control='inputFocusBlur']", function (event) {
            // console.log("focus", this);
            var $this = $(this), val = $this.val(), $parent = $this.parent(), $em = $parent.find("em"), focusCls = $this.attr("data-focus"),
                blurCls = $this.attr("data-blur");
            $parent.addClass("border-color-3986e7").find("i.icon").removeClass(blurCls).addClass(focusCls);
            if (!val) {
                $em.removeClass("hidden").addClass("color3986e7");
            } else {
                $em.addClass("hidden");
            }
        });
        $box.on("blur", "input[data-control='inputFocusBlur']", function () {
            // console.log("blur", this);
            var $this = $(this), val = $this.val(), $parent = $this.parent(), $em = $parent.find("em"), focusCls = $this.attr("data-focus"),
                blurCls = $this.attr("data-blur");
            // $(this).parent().removeClass("border-color-3986e7").find("i.icon").removeClass(focusCls).addClass(blurCls).end().find("em").removeClass("color3986e7");
            $parent.removeClass("border-color-3986e7").find("i.icon").addClass(blurCls).removeClass(focusCls);
            if (!val) {
                $em.removeClass("hidden").removeClass("color3986e7");
            } else {
                $em.addClass("hidden");
            }
        });
        $box.on("keyup", "input[data-control='inputFocusBlur']", function () {
            // console.log("keyup", this);
            // var $this = $(this), focusCls = $this.attr("data-focus"), blurCls = $this.attr("data-blur");
            var $this = $(this), val = $this.val(), $em = $this.parent().find("em"), hintText = $em.html();
            if (!val) {
                $em.removeClass("hidden");
            } else {
                $em.addClass("hidden");
            }
        });

        //修正密码框自动填充问题
        var isAutoFilled = false;
        setTimeout(function () {
            $box.find("input[data-control='inputFocusBlur']").each(function () {
                if (($(this).val())) {
                    $(this).parent().find("em").addClass("hidden");
                    isAutoFilled = true;
                } else {
                    var type = $(this).attr("type");
                    if (isAutoFilled && type && type.toLowerCase() === "password") {
                        $(this).parent().find("em").addClass("hidden");
                    }
                }
            });
        }, 200);
    }


    /**
     * <p>
     * Title:
     * <p>
     * Description:
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年07月14日
     *
     * @param selector{object|string} jquery选择器。列如：document, ".class", "#id"
     * @param eventType{string} 事件类型
     * @param context{object} 定义方法的容器对象
     */
    function _customProxy(selector, eventType, context) {
        var $selector = $(selector);
        if ($selector.length <= 0) {
            console.log("selector no exists --> ", selector);
            return;
        }
        if (!$.isPlainObject(context) || $.isEmptyObject(context)) {
            console.log("invalid context --> ", context);
            return;
        }
        $selector.on(eventType, "[data-control]", function (event) {
            var target = event.target
                // , data = target.dataset || $(target).data()
                // , control = data["control"]
                // , func = context[control]
                ,data,control,func
            ;
            // console.log(Util.sprintf("function --> %s:", control), func);
            while (target !== $selector[0]) {
                data = target.dataset || $(target).data();
                control = data["control"];
                if (control !== undefined) {
                    func = context[control];
                    break;
                }
                target = target.parentNode;
            }
            // console.log(target);

            if (!$.isFunction(func)) {
                console.log("function [" + control + "] no exists");
                return;
            }
            func.call(target);
            return false;
        });
    }

    // function _isValidPhone(phone) {
    //     if (!Util.matchRegex(tel, Util.Regex.loginPhone)) {
    //         _warn("")
    //         return false;
    //     }
    //     return true;
    // }

    /**
     * <p>
     * Title:        _UEditorParse
     * <p>
     * Description:  UEditor编辑内容的显示
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年07月21日
     *
     * @param selector 回显内容容器的选择器。id选择器或class选择器
     */
    function _UEditorParse(selector) {
        uParse(selector, {rootPath: Hredu.basePath + "/plugin/ueditor/"});
    }

    /**
     * <p>
     * Title:        _isValidPwd
     * <p>
     * Description:  是否是有效的密码
     *
     * @author       fangtl.cs@adtis.com.cn
     * @date         2017年08月17日
     *
     * @param pwd {string} 密码
     * @param [minLength] 密码最小长度。默认值是 6
     * @param [maxLength] 密码最大长度。默认值是20
     * @returns {boolean} true 密码有效；否则密码无效
     */
    function _isValidPwd(pwd, minLength, maxLength) {
        if (!pwd) {
            _warn("请输入密码");
            return false;
        }
        minLength = Util.isNum(minLength) ? parseInt(minLength) : 6;
        maxLength = Util.isNum(maxLength) ? parseInt(maxLength) : 20;
        if (minLength > maxLength) {
            console.log("minLength greater than maxLength");
            minLength = 6;
            maxLength = 20;
        }
        var length = pwd.length;
        if (length < minLength || length > maxLength) {
            _warn("密码长度不正确，6到20位的任意非空白字符");
            return false;
        }
        return true;
    }

    function _pwdInputKeyup(self) {
        var $self = $(self), val = $self.val();
        // console.log("_pwdInputKeyup val:",val);
        // console.log(/^\S+$/.test(val));
        if (!(/^\S+$/.test(val))) {
            $self.val(Util.stringTrim(val));
        }
    }

    function _findLocationMapper(locationHref, basePath) {
        var subLocationHref = locationHref.substr(locationHref.indexOf(basePath));
        var subURI = subLocationHref.replace(basePath + "/", "");
        var destMapper = subURI.substr(0, subURI.indexOf("/"));
        return destMapper;
    }

    function _limitInput() {
        $("input").each(function () {
            $(this).attr("onkeypress", "return Comm.noSpecial(event)");
        })
    }

    function noSpecial(e) {
        var keynum
        var keychar
        var numcheck
        if (window.event) // IE
        {
            keynum = e.keyCode
        }
        else if (e.which) // Netscape/Firefox/Opera
        {
            keynum = e.which
        }
        keychar = String.fromCharCode(keynum)
        numcheck = /[`~#$&<>|\/\\[\]\|]/im
        return !numcheck.test(keychar)
    }

    /**
     * <p>
     * Title:_getBootstrapTableSelectData
     * <p>
     * Description: bootstraptable 获取选择的数据
     *
     * @author       taroFang@163.com
     * @date         2017年09月21日
     *
     * @param myBootstrapTable {object} bootstrapTable对象
     * @param msg {string} 未选择数据时的提示语
     * @param field {string|number}
     *              string类型时表示获取勾选列数据的指定字段值的数组
     *              number类型时 1-表示获取勾选的列数据 rows
     * @returns {*}
     */
    function _getBootstrapTableSelectData(myBootstrapTable, msg, field) {
        try {
            var rows = myBootstrapTable.bootstrapTable("getSelections");
            var length = $.isArray(rows) ? rows.length : 0;
            if (length <= 0) {
                Comm.info(msg);
                // $.commondlg.warn.show(msg);
                return "";
            }
            if (Util.isStringObj(field)) {
                var ids = [];
                for (var index = 0; index < length; index++) {
                    ids.push(rows[index][field]);
                }
                return ids;
            }
            return rows;
        } catch (e) {
            return "";
        }
    }

    /**
     * <p>
     * Title:        _arrToString
     * <p>
     * Description:  用指定符号拼接一维数据
     *
     * @author       taroFang@163.com
     * @date         2017年09月22日
     *
     *
     * @param arr {Array} 一维数组
     * @param splitPattern {string}
     * @param field 一维数组中元素是对象是，对象的key
     * @returns {*}
     * @private
     */
    function _arrToString(arr, splitPattern, field) {
        if (!$.isArray(arr)) {
            return "";
        }

        splitPattern = !splitPattern ? "," : splitPattern;

        var ids = [];
        if (!field) {
            $.each(arr, function () {
                ids.push(this);
            });
        } else {
            $.each(arr, function () {
                ids.push(this[field]);
            });
        }
        return ids.join(splitPattern);
    }

    /**
     * <p>
     * Title:        _scrollToTop
     * <p>
     * Description:  滚动到顶部
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年09月23日
     */
    function _scrollToTop() {
        // console.log($('html, body').scrollTop());
        if ($('html, body').scrollTop() > 0) {
            $('html, body').animate({scrollTop: 0}, 200);
        }
    }


    function _beforeClickHandler(treeId, treeNode) {
        var zTree = $.fn.zTree.getZTreeObj(treeId);
        if (treeNode.isParent) {
            zTree.expandNode(treeNode);//如果是父节点，则展开该节点
        } else {
            zTree.checkNode(treeNode, !treeNode.checked, true, true);//单击勾选，再次单击取消勾选
        }
    }

    /**
     * <p>
     * Title:        _initTree
     * <p>
     * Description:  初始化树形结构
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年09月23日
     *
     * @param {number|string} type 1-课程分类， 2-课程分级 3-知识库树形结构, 4-讲师分类 5-讲师分级 6-培训地点
     * @param {string} treeId ztree的Ul的Id值
     * @param {function} courseCategoryDlgClickCallbackHandler 单击节点的回调函数
     */
    function _initTree(type, treeId, courseCategoryDlgClickCallbackHandler, ajaxParams) {
        type = !type ? "1" : type.toString();
        var setting, _clickCallbackHandler, ansycObj, simpleData, callback;

        if (!$.isFunction(courseCategoryDlgClickCallbackHandler)) {
            courseCategoryDlgClickCallbackHandler = function (event, treeId, treeNode) {
            }
        }

        _clickCallbackHandler = function (event, treeId, treeNode) {
            courseCategoryDlgClickCallbackHandler(event, treeId, treeNode);
        };

        if (type === "1") {
            setting = {
                view: {
                    dblClickExpand: false,//双击节点时，是否自动展开父节点的标识
                    showLine: true,//是否显示节点之间的连线
                    selectedMulti: false, //设置是否允许同时选中多个节点
                },
                async: {
                    enable: true
                    , autoParam: ["id", "name"]
                    , otherParam: {func: 3, catetoryTreeType: 1}
                    , type: "post"
                    , url: "teachercourseservlet"
                },
                data: {
                    simpleData: {
                        enable: true
                        , idKey: "id"
                        , pIdKey: "pid"
                        , rootPId: 0
                    }
                },
                callback: {
                    beforeAsync: function (treeId, treeNode) {
                        // console.log("beforeAsync", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).myMinLoading();
                        }
                        return true;
                    },
                    onAsyncSuccess: function (event, treeId, treeNode, msg) {
                        // console.log("onAsyncSuccess", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).find("div.loadingBox").remove();
                        }
                    },
                    beforeClick: _beforeClickHandler,
                    onClick: _clickCallbackHandler
                }
            };
            // console.log("courseCtg", setting);
            // console.log("courseCtg treeId", treeId);
            $.fn.zTree.init($("#" + treeId), setting);
        } else if (type === "2") {
            setting = {
                view: {
                    dblClickExpand: false,//双击节点时，是否自动展开父节点的标识
                    showLine: true,//是否显示节点之间的连线
                    selectedMulti: false, //设置是否允许同时选中多个节点
                    showTitle:true//设置title
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "pid",
                        rootPId: 0
                    }
                },
                callback: {
                    beforeClick: _beforeClickHandler,
                    onClick: _clickCallbackHandler
                }
            };
            $.ajax({
                async: true,
                cache: false,
                type: "POST",
                url: "teachercourseservlet",
                data: {
                    "func": "26",
                    "subfunc": "4"
                },
                dataType: "json",
                beforeSend: function (xhr) {
                    $("#" + treeId).myMinLoading();
                },
                complete: function (xhr, textStatus) {
                },
                success: function (result, textStatus, xhr) {
                    if (!checkAjaxResponseHeader(xhr)) {
                        return;
                    }
                    ;
                    $("#" + treeId).empty();
                    // console.log(result);
                    result = result.datas;
                    //add 20171116 by fangtl S
                    var length = $.isArray(result) ? result.length : 0
                        ,item;
                    for (var i = 0; i < length; i ++) {
                        item = result[i];
                        // item.isParent = true;
                    }
                    //add 20171116 by fangtl E
                    $.fn.zTree.init($("#" + treeId), setting, result);
                },
                error: function (xhr, textStatus, errorThrown) {
                    checkAjaxResponseHeader(xhr)
                }
            });
        } else if (type === "3") {
            setting = {
                view: {
                    dblClickExpand: false,
                    showLine: true,
                    selectedMulti: false,
                    showIcon: true//显示 / 隐藏 图标
                    , txtSelectedEnable: false // true / false允许 / 不允许 选择 zTree Dom 内的文本
                },
                data: {
                    simpleData: {
                        enable: true,
                        idKey: "id",
                        pIdKey: "pid",
                        rootPId: 0
                    }
                },
                callback: {
                    beforeClick: _beforeClickHandler,
                    onClick: _clickCallbackHandler
                }
            };
            var $treeBox = $("#" + treeId);
            $.ajax({
                async: true,
                cache: false,
                type: "POST",
                url: "knowledgeservlet",
                data: {"func": "1", "subfunc": "2"},
                dataType: "json",
                beforeSend: function (xhr) {
                    $treeBox.myMinLoading();
                },
                complete: function (xhr, textStatus) {
                },
                success: function (result, textStatus, xhr) {
                    if (!checkAjaxResponseHeader(xhr)) {
                        return;
                    }
                    $treeBox.empty();
                    $.fn.zTree.init($treeBox, setting, result);
                }
            });
        } else if (type === "4") {
            setting = {
                view: {
                    dblClickExpand: false,//双击节点时，是否自动展开父节点的标识
                    showLine: true,//是否显示节点之间的连线
                    selectedMulti: false //设置是否允许同时选中多个节点
                },
                async: {
                    enable: true
                    , autoParam: ["id", "name"]
                    , otherParam: {func: 4, menutype: 1, subfunc: 1, act: 7}
                    , type: "post"
                    , url: Hredu.basePath + "/systemmanage"
                },
                data: {
                    simpleData: {
                        enable: true
                        // , idKey: "id"
                        , idKey: "sysid"
                        , pIdKey: "pid"
                        , rootPId: "1"
                    }
                },
                callback: {
                    beforeAsync: function (treeId, treeNode) {
                        // console.log("beforeAsync", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).myMinLoading();
                        }
                        return true;
                    },
                    onAsyncSuccess: function (event, treeId, treeNode, msg) {
                        // console.log("onAsyncSuccess", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).find("div.loadingBox").remove();
                        }
                    },
                    beforeClick: _beforeClickHandler,
                    onClick: courseCategoryDlgClickCallbackHandler
                }
            };
            $.fn.zTree.init($("#" + treeId), setting);
        } else if (type === "5") {
            setting = {
                view: {
                    dblClickExpand: false,//双击节点时，是否自动展开父节点的标识
                    showLine: true,//是否显示节点之间的连线
                    selectedMulti: false //设置是否允许同时选中多个节点
                },
                async: {
                    enable: true
                    , autoParam: ["id", "name"]
                    , otherParam: {func: 4, menutype: 2, subfunc: 1, act: 6}
                    , type: "post"
                    , url: Hredu.basePath + "/systemmanage"
                },
                data: {
                    simpleData: {
                        enable: true
                        // , idKey: "id"
                        , idKey: "sysid"
                        , pIdKey: "pid"
                        , rootPId: "1"
                    }
                },
                callback: {
                    beforeAsync: function (treeId, treeNode) {
                        // console.log("beforeAsync", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).myMinLoading();
                        }
                        return true;
                    },
                    onAsyncSuccess: function (event, treeId, treeNode, msg) {
                        // console.log("onAsyncSuccess", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).find("div.loadingBox").remove();
                        }
                    },
                    beforeClick: _beforeClickHandler,
                    onClick: courseCategoryDlgClickCallbackHandler
                }
            };
            $.fn.zTree.init($("#" + treeId), setting);
        } else if (type === "6") {
            setting = {
                view: {
                    dblClickExpand: false,//双击节点时，是否自动展开父节点的标识
                    showLine: true,//是否显示节点之间的连线
                    selectedMulti: false //设置是否允许同时选中多个节点
                    ,showTitle: true
                },
                async: {
                    enable: true
                    , autoParam: ["sysid", "name"]
                    , otherParam: {func: 27, subfunc: 32 , act: 4}
                    , type: "post"
                    , url: Hredu.basePath + "/teachercourseservlet"
                    , dataFilter:function (treeId, parentNode, responseData) {
                        return responseData.tree;
                    }
                },
                data: {
                    key: {
                        title: "address"
                    },
                    simpleData: {
                        enable: true
                        , idKey: "sysid"
                        , pIdKey: "pid"
                        , rootPId: "0"
                    }
                },
                callback: {
                    beforeAsync: function (treeId, treeNode) {
                        // console.log("beforeAsync", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).myMinLoading();
                        }
                        return true;
                    },
                    onAsyncSuccess: function (event, treeId, treeNode, msg) {
                        // console.log("onAsyncSuccess", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).find("div.loadingBox").remove();
                        }
                    },
                    beforeClick: _beforeClickHandler,
                    onClick: courseCategoryDlgClickCallbackHandler
                }
            };
            $.fn.zTree.init($("#" + treeId), setting);
        } else if (type === "7") {

            var p = $.isPlainObject(ajaxParams) ? ajaxParams : {};
            var dp = { func : 3, subfunc : 1, act : 7, nouser:1 , addorg:1};//addorg 1 显示岗位 0 不显示
            var rp = $.extend({}, dp, p);

            setting = {
                view : {
                    dblClickExpand : false,
                    showLine : true,
                    selectedMulti : false,
                    showTitle : _showTitleForTree
                },
                async : {
                    autoParam : ["id"],
                    // otherParam : { func : 3, subfunc : 1, act : 6 },
                    otherParam : rp,
                    enable : true,
                    type : "post",
                    url : "systemmanage"
                    ,dataFilter: function (treeId, parentNode, responseData) {
                        // console.log(responseData);
                        var length = $.isArray(responseData) ? responseData.length : 0, item=null;
                        for (var i= 0; i < length; i++) {
                            item = responseData[i];
                            if (item){
                                item["icon"] = "";
                                var type = item["orgtype"];
                                var typename = "";
                                if(type == 20){
                                    typename = "部门";
                                }else if(type == 40){
                                    typename = "岗位"
                                }
                                responseData[i]["typename"] = typename;
                            }
                        }
                        return responseData;
                    }
                },
                data : {
                    simpleData : {
                        enable : true,
                        idKey : "id",
                        pIdKey : "pId",
                        rootPId : ""
                    },
                    key: {
                        title: "typename"
                    }
                }
                ,callback: {
                    beforeAsync: function (treeId, treeNode) {
                        // console.log("beforeAsync", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).myMinLoading();
                        }
                        return true;
                    },
                    onAsyncSuccess: function (event, treeId, treeNode, msg) {
                        // console.log("onAsyncSuccess", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).find("div.loadingBox").remove();
                        }
                    },
                    beforeClick: _beforeClickHandler,
                    onClick: courseCategoryDlgClickCallbackHandler
                }
            };

            var zNodes = [ {
                id : 1,
                pId : 0,
                name : "组织管理",
                isParent : true,
                open : false,
                layer : 1,
                icon: ""
                //icon : "image/system/icon/organizationManage.png"
            } ];
            $.organizationTree = $.fn.zTree.init($("#" + treeId), setting, zNodes);
        } else if (type === "8"){
            var p = $.isPlainObject(ajaxParams) ? ajaxParams : {};
            var dp = { func : 3, subfunc : 1, act : 7, nouser:1 , addorg:1};//addorg 1 显示岗位 0 不显示
            var rp = $.extend({}, dp, p);

            setting = {
                view : {
                    dblClickExpand : false,
                    showLine : true,
                    selectedMulti : false,
                    showTitle : _showTitleForTree
                },
                async : {
                    autoParam : ["id"],
                    // otherParam : { func : 3, subfunc : 1, act : 6 },
                    otherParam : rp,
                    enable : true,
                    type : "post",
                    url : "systemmanage"
                    ,dataFilter: function (treeId, parentNode, responseData) {
                        // console.log(responseData);
                        var length = $.isArray(responseData) ? responseData.length : 0, item=null;
                        for (var i= 0; i < length; i++) {
                            item = responseData[i];
                            if (item){
                                item["icon"] = "";
                                var type = item["orgtype"];
                                var typename = "";
                                if(type == 20){
                                    typename = "部门";
                                }else if(type == 40){
                                    typename = "岗位"
                                }
                                responseData[i]["typename"] = typename;
                            }
                        }
                        return responseData;
                    }
                },
                data : {
                    simpleData : {
                        enable : true,
                        idKey : "id",
                        pIdKey : "pId",
                        rootPId : ""
                    },
                    key: {
                        title: "typename"
                    }
                }
                ,callback: {
                    beforeAsync: function (treeId, treeNode) {
                        // console.log("beforeAsync", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).myMinLoading();
                        }
                        return true;
                    },
                    onAsyncSuccess: function (event, treeId, treeNode, msg) {
                        // console.log("onAsyncSuccess", treeNode);
                        if (!treeNode) {
                            $("#" + treeId).find("div.loadingBox").remove();
                        }
                    },
                    beforeClick: _beforeClickHandler,
                    onClick: courseCategoryDlgClickCallbackHandler
                }
            };

            var zNodes = [ {
                id : 1,
                pId : 0,
                name : "组织管理",
                isParent : true,
                open : false,
                layer : 1,
                icon: ""
                //icon : "image/system/icon/organizationManage.png"
            } ];
            $.organizationTree = $.fn.zTree.init($("#" + treeId), setting, zNodes);
        }
    }
    function _showTitleForTree(treeId, treeNode) {
        return treeNode.level != 0;
    }
    // function _courseCategoryDlgClickCallbackHandler(event, treeId, treeNode) {
    //     // var currentCategory = treeNode.name;
    //     // var parentNode = treeNode.getParentNode();
    //     // while (parentNode != null) {
    //     //     currentCategory = parentNode.name + "&nbsp;-&nbsp;" + currentCategory;
    //     //     parentNode = parentNode.getParentNode();
    //     // }
    //     // console.log(currentCategory);
    // }

    /**
     * <p>
     * Title:        _courseCategoryDlg
     * <p>
     * Description:  课程分类选择弹框
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年09月23日
     *
     * @param {function} selectBtnClickHandler 弹框中选择按钮单击回调事件
     * @param {function} reloadBtnClickHandler 弹框中重新加载按钮单击回调事件
     * @param {function} clickCallbackHandler 谭宽中选中节点回调事件
     */
    function _courseCategoryDlg(selectBtnClickHandler, reloadBtnClickHandler, clickCallbackHandler) {
        var dlgId = "commonCourseCategoryDlg"
            , ulId = "commonCourseCategoryDlgUl_ztree"
            , $modal = _initModal(dlgId, true, true)
            , _selectBtnClickHandler = function () {
        };

        if ($.isFunction(selectBtnClickHandler)) {
            _selectBtnClickHandler = function () {
                // console.log("select");
                var treeObj = $.fn.zTree.getZTreeObj(ulId);
                var nodes = treeObj.getSelectedNodes();
                if (nodes == null || !$.isArray(nodes) || nodes.length <= 0) {
                    _info("请选择课程分类");
                    return;
                }
                selectBtnClickHandler(ulId, nodes, $modal);
                $modal.modal("hide");
            };
        }
        if (!$.isFunction(clickCallbackHandler)) {
            clickCallbackHandler = function () {
            };
        }
        if (!$.isFunction(reloadBtnClickHandler)) {
            reloadBtnClickHandler = function () {
                // console.log("reload");
                _initTree(1, ulId, clickCallbackHandler);
                // var treeObj = $.fn.zTree.getZTreeObj(ulId);
                // treeObj.refresh();
            };
        }

        _initTree(1, ulId, clickCallbackHandler);
        $modal.find("button.btn-reload").unbind("click").bind("click", reloadBtnClickHandler);
        $modal.find("button.btn-select").unbind("click").bind("click", _selectBtnClickHandler);
    }

    /**
     * <p>
     * Title:        _ztreeBowserDlg
     * <p>
     * Description:  ztree浏览弹框
     *
     * @author       fangtl.cs@admin.com.cn
     * @date         2017年09月23日
     *
     * @param {number|string} type 1-课程分类， 2-课程分级, 3-知识库树形结构, 4-讲师分类 5-讲师分级 6-培训地点 7-组织机构org
     * @param {function} selectBtnClickHandler 弹框中选择按钮单击回调事件 参数：ztreeId, nodes, $modal
     * @param {function} [reloadBtnClickHandler] 弹框中重新加载按钮单击回调事件
     * @param {function} [clickCallbackHandler] 谭宽中选中节点回调事件 参数: event, treeId, treeNode
     * @param {number} hideZindex 模态框隐藏时遮罩层z-index
     * @param {number} displayZindex 模态框显示区域z-index
     * @param {number} showZindex 模态框显示时遮罩层z-index
     */
    function _ztreeBowserDlg(type, selectBtnClickHandler, reloadBtnClickHandler, clickCallbackHandler,hideZindex, displayZindex, showZindex, ajaxParams, submitBtnClickHandler) {
        var dlgId = "", ulId = "", msg = "";
        type = !type ? "1" : type.toString();
        if (type === "1") {
            dlgId = "commonCourseCategoryDlg";
            ulId = "commonCourseCategoryDlgUl_ztree";
            msg = "请选择课程分类";
        } else if (type === "2") {
            dlgId = "commonCourseGradeDlg";
            ulId = "commonCourseGradeDlgUl_ztree";
            msg = "请选择课程分级";
        } else if (type === "3") {
            dlgId = "commonKnowledgeDlg";
            ulId = "commonKnowledgeDlgUl_ztree";
            msg = "请选择课知识库";
        } else if (type === "4") {
            dlgId = "commonLecturerCategoryDlg";
            ulId = "commonLecturerCategoryDlgUl_ztree";
            msg = "请选择讲师分类";
        } else if (type === "5") {
            dlgId = "commonLecturerGradeDlg";
            ulId = "commonLecturerGradeDlgUl_ztree";
            msg = "请选择讲师分级";
        } else if (type === "6") {
            dlgId = "commonTrainPlaceDlg1506479076130";
            ulId = "commonTrainPlaceDlg1506479076130Ul_ztree";
            msg = "请选择讲培训地点";
        } else if (type === "7") {
            dlgId = "commonOrgDlg1508302231263";
            ulId = "commonOrgDlg1508302231263Ul_ztree";
            msg = "请选择组织";
        } else if (type === "8") {
            dlgId = "commonOrgDlg1508302231265";
            ulId = "commonOrgDlg1508302231265Ul_ztree";
            msg = "请选择组织";
        }


        var $modal = _initModal(dlgId, true, true, null, hideZindex, displayZindex, showZindex)
            , _selectBtnClickHandler = function () {
        };

        if ($.isFunction(selectBtnClickHandler)) {
            _selectBtnClickHandler = function () {
                // console.log("select");
                var treeObj = $.fn.zTree.getZTreeObj(ulId);
                var nodes = treeObj.getSelectedNodes();
                if (!$.isArray(nodes) || nodes.length <= 0) {
                    _info(msg);
                    return;
                }
                if (!nodes[0].getParentNode()) {
                    _info("不能选择根节点,请选择其子节点");
                    return;
                }
                //add 20171204 by fangtl S
                if (type === "7") {
                    if ("1" !== nodes[0]["canSelected"]) {
                        _info("不能选择该节点,请选择其子节点");
                        return;
                    }
                }
                //add 20171204 by fangtl E
                selectBtnClickHandler(ulId, nodes, $modal);
                $modal.modal("hide");
            };
        }
        if (!$.isFunction(clickCallbackHandler)) {
            clickCallbackHandler = function () {
            };
        }
        if($.isFunction(submitBtnClickHandler)){
            var _submitBtnClickHandler = function () {
                var treeObj = $.fn.zTree.getZTreeObj(ulId);
                var nodes = treeObj.getSelectedNodes();
                if (!$.isArray(nodes) || nodes.length <= 0) {
                    _info(msg);
                    return;
                }
                if (!nodes[0].getParentNode()) {
                    _info("不能选择根节点,请选择其子节点");
                    return;
                }
                submitBtnClickHandler(ulId, nodes, $modal);
            }
        }
        if (!$.isFunction(reloadBtnClickHandler)) {
            reloadBtnClickHandler = function () {
                // console.log("reload");
                _initTree(type, ulId, clickCallbackHandler, ajaxParams);
                // var treeObj = $.fn.zTree.getZTreeObj(ulId);
                // treeObj.refresh();
            };
        }

        _initTree(type, ulId, clickCallbackHandler, ajaxParams);
        $modal.find("button.btn-reload").unbind("click").bind("click", reloadBtnClickHandler);
        $modal.find("button.btn-select").unbind("click").bind("click", _selectBtnClickHandler);
        $modal.find("button.btn-submit").unbind("click").bind("click", _submitBtnClickHandler);
    }


    function _getZtreeCurrentNodeFullName(treeNode, connector) {
        connector = !connector ? "＞" : connector;
        var currentCategory = treeNode.name;
        var parentNode = treeNode.getParentNode();
        while (parentNode != null) {
            currentCategory = parentNode.name + connector + currentCategory;
            parentNode = parentNode.getParentNode();
        }
        return currentCategory;
    }


    function _getZtreeSelectedNodes(ztreeObject, rootNodeUsed) {

    }


    /**
     * isMultiselect true-是多选，否则不是多选
     * */
    var __lecturerDlgInit = false;
    function _lecturerBrowseDlg(selectBtnClickHandler, isMultiselect) {
        var dlgId = "commonLecturerDlg"
            , tableId = "commonLecturerDlg_table"
            , _reloadBtnClickHandler
            , _selectBtnClickHandler = function () { }
            ,$modal = _initModal(dlgId, true, true, null, 1040, 1040, 1035);
        if ($.isFunction(selectBtnClickHandler)) {
            _selectBtnClickHandler = function (e, value, row, index) {
                selectBtnClickHandler(e, value, row, index);
                $modal.modal("hide");
            }
        }
        _reloadBtnClickHandler = function () {
            $("#"+tableId).bootstrapTable("refresh");
        };

        //add 20171020 by fangtl S
        if (isMultiselect === true) {
            $("#"+dlgId).find("div.btn-box").find("td.dlg-td-input").attr("style", "width:160px;")
                .end().find("button[data-control='multiselectBtnHandler']").removeClass("hidden");
        } else {
            $("#"+dlgId).find("div.btn-box").find("td.dlg-td-input").attr("style", "")
                .end().find("button[data-control='multiselectBtnHandler']").addClass("hidden");
        }
        //add 20171020 by fangtl E

        var _resetHandler = function (haveReload) {
            $modal.find("input.form-control").val("");
            $modal.find("input[name='sysctgid']").val("0");
            $modal.find("input[name='sysgradeid']").val("0");
            if (haveReload === true) {
                _reloadBtnClickHandler();
            }
        };
        _resetHandler();//重置输入框，无重新加载

        var _selectFormatterHandler = function (value, row, index) {
            return '<span class="glyphicon glyphicon-ok finger text-609ee9 myselect" title="选择"></span>';
        };
        var _classificationFormatterHandler = function (value, row, index) {
            var teacherCategory = "";
            try {
                teacherCategory = row["teacherCategory"]["name"]
            } catch(e){}
            return Util.sprintf("<div class='w200 nowrap-ellipsis'>%s</div>", teacherCategory);
        };
        var _gradeFormatterHandler = function (value, row, index) {
            var teacherGrade = "";
            try {
                teacherGrade = row["teacherGrade"]["name"]
            } catch(e){}
            return Util.sprintf("<span class='w200 nowrap-ellipsis'>%s</span>", teacherGrade);
        };
        var _idFormatterHandler = function (value, row, index) {
            return Util.sprintf('<div class="w200 nowrap-ellipsis" title="%s">%s</div>', value, value);
        };
        var _nameFormatterHandler = function (value, row, index) {
            return Util.sprintf('<div class="w150 nowrap-ellipsis" title="%s">%s</div>', value, value);
        };

        var _CRTableColumns = [
            { field : "code",align : "center", title : "ID", width:"20%", formatter:_idFormatterHandler }
            ,{ field : "name", align : "center", title : "姓名", width:"15%", formatter:_nameFormatterHandler }
            ,{ field : "classification", align : "center", title : "分类", width:"20%", formatter: _classificationFormatterHandler }
            ,{ field : "grade", align : "center", title : "分级",  width:"20%", formatter: _gradeFormatterHandler }
            // ,{ field : "type", align : "center", title : "类型", width:"15%" }
            ,{ field : "sysid", align : "center", title : "选择", width:"10%", formatter: _selectFormatterHandler, events:{"click .myselect":_selectBtnClickHandler}}
        ];
        if (isMultiselect === true) {
            _CRTableColumns = [
                { checkbox: true,align : "center" }
                ,{ field : "code",align : "center", title : "ID", width:"20%", formatter:_idFormatterHandler }
                ,{ field : "name", align : "center", title : "姓名", width:"15%", formatter:_nameFormatterHandler }
                ,{ field : "classification", align : "center", title : "分类", width:"20%", formatter: _classificationFormatterHandler }
                ,{ field : "grade", align : "center", title : "分级",  width:"20%", formatter: _gradeFormatterHandler }
                // ,{ field : "type", align : "center", title : "类型", width:"15%" }
                // ,{ field : "sysid", align : "center", title : "选择", width:"10%", formatter: _selectFormatterHandler, events:{"click .myselect":_selectBtnClickHandler}}
            ];
        }

        $("#"+tableId).bootstrapTable("destroy").bootstrapTable({
            url: Hredu.basePath + "/systemmanage"
            ,pageNumber: 1
            ,pageSize: 5
            ,queryParams : function queryParams(params) {
                var likeCon = $modal.find("input[type='text'][name='lickcon']").val();
                likeCon = !likeCon ? "" : Util.stringTrim(likeCon);
                var sysctgid = $modal.find("input[name='sysctgid']").val();
                var sysgradeid = $modal.find("input[name='sysgradeid']").val();
                return {
                    func:4
                    ,menutype:3
                    ,subfunc:1
                    ,act:4
                    ,sortcolumn:"lastupdate"
                    ,sort:0
                    ,sysgradeid:sysgradeid
                    ,sysctgid:sysctgid
                    ,likecondition: likeCon
                    ,offset:params.offset
                    ,limit:params.limit
                };
            }
            ,columns : _CRTableColumns
        });


        if (!__lecturerDlgInit) {
            var modalContext = {
                browerLecturerCategoryHandelr: function () {
                    var $this = $(this)
                        , $parent = $this.parent()
                        , $idInput = $parent.find("input[name='sysctgid']")
                        , $nameInput = $parent.find("input.form-control");
                    var __selectCategoryHandler = function (ztreeId, nodes) {
                        var node = nodes[0]
                            , id = node["sysid"]
                            , fullName = Comm.getZtreeCurrentNodeFullName(node);
                        $idInput.val(id);
                        $nameInput.val(fullName).attr("title", fullName);
                    };
                    _ztreeBowserDlg("4", __selectCategoryHandler, null, null, 1035);
                }
                ,browerLecturerGradeHandelr: function () {
                    var $this = $(this)
                        , $parent = $this.parent()
                        , $idInput = $parent.find("input[name='sysgradeid']")
                        , $nameInput = $parent.find("input.form-control");
                    var __selectGradeHandler = function (ztreeId, nodes) {
                        var node = nodes[0]
                            , id = node["sysid"]
                            , fullName = Comm.getZtreeCurrentNodeFullName(node);
                        $idInput.val(id);
                        $nameInput.val(fullName).attr("title", fullName);
                    };
                    _ztreeBowserDlg("5", __selectGradeHandler, null, null, 1035);
                }
                ,dlgLeaturerSearchHandler: function () {
                    _reloadBtnClickHandler();
                }
                ,resetHandler:function () {
                    _resetHandler(true);
                }
                ,multiselectBtnHandler: function () {
                    var rows = $("#"+tableId).bootstrapTable("getSelections");
                    var length = $.isArray(rows) ? rows.length : 0;
                    if (length <= 0) {
                        Comm.info("您未选择讲师", null, {hideZindex:1035});
                        // $.commondlg.warn.show(msg);
                        return "";
                    }
                    if (!rows) { return; }
                    selectBtnClickHandler(rows);
                    $modal.modal("hide");
                }
            };
            // $modal.find("button.btn-reload").unbind("click").bind("click", _reloadBtnClickHandler);
            // $modal.find("button.btn-select").unbind("click").bind("click", _selectBtnClickHandler);
            _customProxy("#"+dlgId, "click", modalContext);
        }
        __lecturerDlgInit = true;
    }

    /**
     * <p>
     * Title:        _tdWidthHandler
     * <p>
     * Description: 设置table中td宽度
     *
     * @author       taroFang@163.com
     * @date         2017年09月26日
     *
     *
     * @param value td中的值
     * @param wclass 宽度样式
     * @param nowrapEllipsis true-超宽隐藏文字 false-超宽文字换行
     * @returns {*}
     * @private
     */
    function _tdWidthHandler(value, wclass, nowrapEllipsis) {
        value = (!value && value !== 0) ? "-" : value;
        var html = '';
        if (value === "-") {
            html = '<div class="%s">%s</div>';
            if (nowrapEllipsis === true) {
                html = '<div class="%s nowrap-ellipsis">%s</div>';
            }
            return Util.sprintf(html,wclass, value);
        } else {
            html = '<div class="%s" title="%s">%s</div>';
            if (nowrapEllipsis === true) {
                html = '<div class="%s nowrap-ellipsis" title="%s">%s</div>';
            }
            return Util.sprintf(html,wclass, value, value);
        }
    }

    var _knowledgeBrowseDlgInit = false;
    function _knowledgeBrowseDlg(selectBtnClickHandler) {
        var dlgId = "commonKnowledgeFileDlg"
            , tableId = "commonKnowledgeFileDlg_table"
            , dropdownId = "commonKnowledgeFileDlg_type_dropdown"
            , _reloadBtnClickHandler
            , _selectBtnClickHandler=function () {}
            ,$modal = _initModal(dlgId, true, true, null, 1040, 1040, 1035);
        _reloadBtnClickHandler = function () {
            $("#"+tableId).bootstrapTable("refresh");
        };

        if ($.isFunction(selectBtnClickHandler)) {
            _selectBtnClickHandler = function (e, value, row, index) {
                selectBtnClickHandler(e, value, row, index);
                $modal.modal("hide");
            }
        }


        var _resetHandler = function (haveReload) {
            $modal.find("input.form-control").val("");
            $modal.find("input[name='sysctgid']").val("0");
            // $modal.find("input[name='sysgradeid']").val("0");
            // _initDropdown(dropdownId, "0");
            $("#"+dropdownId).find("span.default-val").html("全部").attr("val", "-1");
            if (haveReload === true) {
                _reloadBtnClickHandler();
            }
        };
        _resetHandler();//重置输入框，无重新加载

        function _fileTyeFormatterHandler(value, row, index) {
            var type = Util.toString(row["file_type"]), typeStr=null;
            if(type === "1"){
                typeStr = "视频";
            }else if(type === "2"){
                typeStr = "PDF";
            }else if(type === "3"){
                typeStr = "word";
            }else if(type === "4" || type === "0"){
                typeStr = "其他";
            }
            return typeStr;
        }
        var _selectFormatterHandler = function (value, row, index) {
            return '<span class="glyphicon glyphicon-ok finger text-609ee9 myselect" title="选择"></span>';
        };

        var _zyTableColumns = [
            // { checkbox:true, width: "10%" }
            { field : "title",align : "center", title : "资源名称"}
            ,{ field : "cateName", align : "center", title : "知识库"}
            ,{ field : "filetype", align : "center", title : "文件类型",formatter: _fileTyeFormatterHandler }
            ,{  align : "center", title : "选择", width:"10%", formatter: _selectFormatterHandler, events:{"click .myselect":_selectBtnClickHandler}}
        ];

        $("#"+tableId).bootstrapTable("destroy").bootstrapTable({
            url: Hredu.basePath + "/knowledgeservlet"
            ,pageNumber: 1
            ,pageSize: 5
            ,queryParams : function queryParams(params) {
                var likeCon = $modal.find("input[type='text'][name='lickcon']").val();
                likeCon = !likeCon ? "" : Util.stringTrim(likeCon);
                var sysctgid = $modal.find("input[name='sysctgid']").val();
                sysctgid = sysctgid <= 0 ? "" : sysctgid;
                // var sysgradeid = $modal.find("input[name='sysgradeid']").val();
                var fileType = Comm.getDropdownVal(dropdownId);
                return {
                    func:2
                    ,subfunc:4
                    // ,act:4
                    ,sortcolumn:"lastupdate"
                    ,sort:"desc"
                    ,filetype:fileType
                    ,syscategoryid:sysctgid
                    ,likecondition: likeCon
                    ,offset:params.offset
                    ,limit:params.limit
                };
            }
            ,columns : _zyTableColumns
        });


        if (!_knowledgeBrowseDlgInit) {
            var modalContext = {
                browerKnowledgeCategoryHandelr: function () {
                    var $this = $(this)
                        , $parent = $this.parent()
                        , $idInput = $parent.find("input[name='sysctgid']")
                        , $nameInput = $parent.find("input.form-control");
                    var __selectCategoryHandler = function (ztreeId, nodes) {
                        var node = nodes[0]
                            , id = node["id"]
                            // , fullName = Comm.getZtreeCurrentNodeFullName(node);
                            , fullName = node["name"];
                        $idInput.val(id);
                        $nameInput.val(fullName).attr("title", fullName);
                    };
                    _ztreeBowserDlg("3", __selectCategoryHandler, null, null, 1035);
                }
                ,dlgSearchHandler: function () {
                    _reloadBtnClickHandler();
                }
                ,resetHandler:function () {
                    _resetHandler(true);
                }
                // ,selectBtnHandler:function () {
                //     var rows = $("#"+tableId).bootstrapTable("getSelections");
                //     var length = $.isArray(rows) ? rows.length : 0;
                //     if (length <= 0) {
                //         Comm.info("请选择资源", null, {hideZindex:1035, displayZindex:1050, showZindex:1045});
                //         return ;
                //     }
                //     selectBtnClickHandler(rows);
                //     $modal.modal("hide");
                // }
            };
            // $modal.find("button.btn-reload").unbind("click").bind("click", _reloadBtnClickHandler);
            // $modal.find("button.btn-select").unbind("click").bind("click", _selectBtnClickHandler);
            _customProxy("#"+dlgId, "click", modalContext);
            _initDropdown(dropdownId, "-1");
        }
        _knowledgeBrowseDlgInit = true;
    }


    var _trainTypeBrowseDlgInit = false;
    function _trainTypeBrowseDlg(selectBtnClickHandler) {
        var dlgId = "commonTrainTypeDlg1506569832538"
            , tableId = "commonTrainTypeDlg1506569832538_table"
            , _reloadBtnClickHandler
            , _selectBtnClickHandler=function () {}
            ,$modal = _initModal(dlgId, true, true, null, 1040, 1040, 1035);
        _reloadBtnClickHandler = function () {
            $("#"+tableId).bootstrapTable("refresh");
        };

        if ($.isFunction(selectBtnClickHandler)) {
            _selectBtnClickHandler = function (e, value, row, index) {
                selectBtnClickHandler(row);
                $modal.modal("hide");
            }
        }


        var _resetHandler = function (haveReload) {
            $modal.find("input.form-control").val("");
            if (haveReload === true) {
                _reloadBtnClickHandler();
            }
        };
        _resetHandler();//重置输入框，无重新加载

        var _selectFormatterHandler = function (value, row, index) {
            return '<span class="glyphicon glyphicon-ok finger text-609ee9 myselect" title="选择"></span>';
        };

        var _zyTableColumns = [
            // { checkbox:true, width: "10%" }
            { field : "code",align : "center", title : "培训类型ID"}
            ,{ field : "name", align : "center", title : "培训类型名称"}
            // ,{ field : "filetype", align : "center", title : "文件类型",formatter: _fileTyeFormatterHandler }
            ,{  align : "center", title : "选择", width:"10%", formatter: _selectFormatterHandler, events:{"click .myselect":_selectBtnClickHandler}}
        ];

        $("#"+tableId).bootstrapTable("destroy").bootstrapTable({
            url: Hredu.basePath + "/teachercourseservlet"
            ,pageNumber: 1
            ,pageSize: 5
            ,queryParams : function queryParams(params) {
                var likeCon = $modal.find("input[type='text'][name='lickcon']").val();
                likeCon = !likeCon ? "" : Util.stringTrim(likeCon);
                return {
                    func:27
                    ,subfunc:30
                    ,act:4
                    ,sortcolumn:"lastupdate"
                    ,sortdir:"desc"
                    ,likeCondition: likeCon
                    ,offset:params.offset
                    ,limit:params.limit
                };
            }
            ,columns : _zyTableColumns
        });


        if (!_trainTypeBrowseDlgInit) {
            var modalContext = {
                dlgSearchHandler: function () {
                    _reloadBtnClickHandler();
                }
                ,resetHandler:function () {
                    _resetHandler(true);
                }
            };
            _customProxy("#"+dlgId, "click", modalContext);
            // _initDropdown(dropdownId, "-1");
        }
        _trainTypeBrowseDlgInit = true;
    }

    var _trainOrgBrowseDlgInit = false;
    function _trainOrgBrowseDlg(selectBtnClickHandler) {
        var dlgId = "commonTrainOrgDlg1506576454231"
            , tableId = "commonTrainOrgDlg1506576454231_table"
            , dropdownId = "commonTrainOrgDlg1506576454231_type_dropdown"
            , _reloadBtnClickHandler
            , _selectBtnClickHandler=function () {}
            ,$modal = _initModal(dlgId, true, true, null, 1040, 1040, 1035);
        _reloadBtnClickHandler = function () {
            $("#"+tableId).bootstrapTable("refresh");
        };

        if ($.isFunction(selectBtnClickHandler)) {
            _selectBtnClickHandler = function (e, value, row, index) {
                selectBtnClickHandler(row);
                $modal.modal("hide");
            }
        }


        var _resetHandler = function (haveReload) {
            $modal.find("input.form-control").val("");
            $modal.find("input[name='sysctgid']").val("0");
            // $modal.find("input[name='sysgradeid']").val("0");
            // _initDropdown(dropdownId, "0");
            $("#"+dropdownId).find("span.default-val").html("全部").attr("val", "-1");
            if (haveReload === true) {
                _reloadBtnClickHandler();
            }
        };
        _resetHandler();//重置输入框，无重新加载

        function _fileTyeFormatterHandler(value, row, index) {
            var type = Util.toString(value), typeStr=null;
            if(type === "0"){
                typeStr = "内部培训机构";
            }else if(type === "1") {
                typeStr = "外部培训机构";
            } else {
                typeStr = "-";
            }
            return typeStr;
        }
        var _selectFormatterHandler = function (value, row, index) {
            return '<span class="glyphicon glyphicon-ok finger text-609ee9 myselect" title="选择"></span>';
        };

        var _zyTableColumns = [
            // { checkbox:true, width: "10%" }
            { field : "name",align : "center", title : "名称"}
            ,{ field : "type", align : "center", title : "类型",formatter: _fileTyeFormatterHandler }
            ,{ field : "address", align : "center", title : "地址"}
            ,{  align : "center", title : "选择", width:"10%", formatter: _selectFormatterHandler, events:{"click .myselect":_selectBtnClickHandler}}
        ];

        $("#"+tableId).bootstrapTable("destroy").bootstrapTable({
            url: Hredu.basePath + "/teachercourseservlet"
            ,pageNumber: 1
            ,pageSize: 5
            ,queryParams : function queryParams(params) {
                var likeCon = $modal.find("input[type='text'][name='lickcon']").val();
                likeCon = !likeCon ? "" : Util.stringTrim(likeCon);
                var type = Comm.getDropdownVal(dropdownId);
                return {
                    func:27
                    ,subfunc:31
                    ,act:4
                    ,sortcolumn:"lastupdate"
                    ,sortdir:"desc"
                    ,type:type
                    ,name: likeCon
                    ,offset:params.offset
                    ,limit:params.limit
                };
            }
            ,columns : _zyTableColumns
        });


        if (!_trainOrgBrowseDlgInit) {
            var modalContext = {
                dlgSearchHandler: function () {
                    _reloadBtnClickHandler();
                }
                ,resetHandler:function () {
                    _resetHandler(true);
                }
            };
            // $modal.find("button.btn-reload").unbind("click").bind("click", _reloadBtnClickHandler);
            // $modal.find("button.btn-select").unbind("click").bind("click", _selectBtnClickHandler);
            _customProxy("#"+dlgId, "click", modalContext);
            _initDropdown(dropdownId, "-1");
        }
        _trainOrgBrowseDlgInit = true;
    }

    var _trainCourseBrowseDlgInit = false;
    function _trainCourseBrowseDlg(selectBtnClickHandler) {
        var dlgId = "commonTrainCourseDlg1506581640932"
            , tableId = "commonTrainCourseDlg1506581640932_table"
            // , dropdownId = "commonTrainOrgDlg1506576454231_type_dropdown"
            , _reloadBtnClickHandler
            , _selectBtnClickHandler=function () {}
            ,$modal = _initModal(dlgId, true, true, null, 1040, 1040, 1035);
        _reloadBtnClickHandler = function () {
            $("#"+tableId).bootstrapTable("refresh");
        };

        if ($.isFunction(selectBtnClickHandler)) {
            _selectBtnClickHandler = function (e, value, row, index) {
                selectBtnClickHandler(row);
                $modal.modal("hide");
            }
        }


        var _resetHandler = function (haveReload) {
            $modal.find("input.form-control").val("").attr("title","");
            $modal.find("input[name='sysctgid']").val("-1");
            // $modal.find("input[name='sysgradeid']").val("0");
            // _initDropdown(dropdownId, "0");
            // $("#"+dropdownId).find("span.default-val").html("全部").attr("val", "-1");
            if (haveReload === true) {
                _reloadBtnClickHandler();
            }
        };
        _resetHandler();//重置输入框，无重新加载

        // function _fileTyeFormatterHandler(value, row, index) {
        //     var type = Util.toString(value), typeStr=null;
        //     if(type === "0"){
        //         typeStr = "内部培训机构";
        //     }else if(type === "1") {
        //         typeStr = "外部培训机构";
        //     } else {
        //         typeStr = "-";
        //     }
        //     return typeStr;
        // }
        var _selectFormatterHandler = function (value, row, index) {
            return '<span class="glyphicon glyphicon-ok finger text-609ee9 myselect" title="选择"></span>';
        };

        var _zyTableColumns = [
            // { checkbox:true, width: "10%" }
            { field : "courseid",align : "center", title : "ID"}
            ,{ field : "coursename",align : "center", title : "名称"}
            // ,{ field : "type", align : "center", title : "类型",formatter: _fileTyeFormatterHandler }
            ,{ field : "lecturername", align : "center", title : "讲师" }
            // ,{ field : "credit", align : "center", title : "学分"}
            ,{  align : "center", title : "选择", width:"10%", formatter: _selectFormatterHandler, events:{"click .myselect":_selectBtnClickHandler}}
        ];

        $("#"+tableId).bootstrapTable("destroy").bootstrapTable({
            url: Hredu.basePath + "/teachercourseservlet"
            ,pageNumber: 1
            ,pageSize: 5
            ,queryParams : function queryParams(params) {
                var likeCon = $modal.find("input[type='text'][name='lickcon']").val();
                likeCon = !likeCon ? "" : Util.stringTrim(likeCon);
                // var type = Comm.getDropdownVal(dropdownId);
                var sysctgid = $modal.find("input[type='hidden'][name='sysctgid']").val();
                return {
                    func:11
                    ,subfunc:1
                    // ,act:4
                    ,column:"lastupdated_date"
                    ,asc:"false"
                    ,ctgid:sysctgid
                    ,type:0
                    ,likecondition: likeCon
                    ,offset:params.offset
                    ,limit:params.limit
                };
            }
            ,columns : _zyTableColumns
        });


        if (!_trainCourseBrowseDlgInit) {
            var modalContext = {
                browerCourseCategoryHandelr:function () {
                    var $this = $(this)
                        , $parent = $this.parent()
                        , $idInput = $parent.find("input[name='sysctgid']")
                        , $nameInput = $parent.find("input.form-control");
                    var __selectedHandler = function (ztreeId, nodes) {
                        var node = nodes[0]
                            , id = node["id"]
                            , name = node["name"]
                            , fullName = Comm.getZtreeCurrentNodeFullName(node);
                        $idInput.val(id);
                        $nameInput.val(name).attr("title", fullName);
                    };
                    _ztreeBowserDlg("1", __selectedHandler, null, null, 1035);
                }
                ,dlgSearchHandler: function () {
                    _reloadBtnClickHandler();
                }
                ,resetHandler:function () {
                    _resetHandler(true);
                }
            };
            _customProxy("#"+dlgId, "click", modalContext);
        }
        _trainCourseBrowseDlgInit = true;
    }

    var _trainRequireBrowseDlgInit = false;
    function _trainRequireBrowseDlg(selectBtnClickHandler) {
        var dlgId = "commonTrainRequireDlg1506736699361"
            , tableId = "commonTrainRequireDlg1506736699361_table"
            // , dropdownId = "commonTrainOrgDlg1506576454231_type_dropdown"
            , _reloadBtnClickHandler
            , _selectBtnClickHandler=function () {}
            ,$modal = _initModal(dlgId, true, true, null, 1040, 1040, 1035, "400px");
        _reloadBtnClickHandler = function () {
            $("#"+tableId).bootstrapTable("refresh");
        };

        if ($.isFunction(selectBtnClickHandler)) {
            _selectBtnClickHandler = function (e, value, row, index) {
                selectBtnClickHandler(row);
                $modal.modal("hide");
            }
        }


        var _resetHandler = function (haveReload) {
            $modal.find("input.form-control").val("").attr("title","");
            // $modal.find("input[name='sysctgid']").val("-1");
            // $modal.find("input[name='sysgradeid']").val("0");
            // _initDropdown(dropdownId, "0");
            // $("#"+dropdownId).find("span.default-val").html("全部").attr("val", "-1");
            if (haveReload === true) {
                _reloadBtnClickHandler();
            }
        };
        _resetHandler();//重置输入框，无重新加载

        // function _fileTyeFormatterHandler(value, row, index) {
        //     var type = Util.toString(value), typeStr=null;
        //     if(type === "0"){
        //         typeStr = "内部培训机构";
        //     }else if(type === "1") {
        //         typeStr = "外部培训机构";
        //     } else {
        //         typeStr = "-";
        //     }
        //     return typeStr;
        // }
        var _trainTypeFormatterHandler = function(value, row, index) {
            var name = "-";
            try {
                name = row["trainType"]["name"];
            } catch(e){}
            return Util.sprintf("<div>%s</div>",name);
        }
        var _selectFormatterHandler = function (value, row, index) {
            return '<span class="glyphicon glyphicon-ok finger text-609ee9 myselect" title="选择"></span>';
        };

        var _zyTableColumns = [
            // { checkbox:true, width: "10%" }
            { field : "code",align : "center", title : "编号"}
            ,{ field : "name",align : "center", title : "名称"}
            ,{ field : "trainType", align : "center", title : "培训类型",formatter: _trainTypeFormatterHandler }
            // ,{ field : "lecturername", align : "center", title : "讲师" }
            // ,{ field : "credit", align : "center", title : "学分"}
            ,{  align : "center", title : "选择", width:"10%", formatter: _selectFormatterHandler, events:{"click .myselect":_selectBtnClickHandler}}
        ];

        $("#"+tableId).bootstrapTable("destroy").bootstrapTable({
            url: Hredu.basePath + "/trainrequireservlet"
            ,pageNumber: 1
            ,pageSize: 5
            ,queryParams : function queryParams(params) {
                var likeCon = $modal.find("input[type='text'][name='lickcon']").val();
                likeCon = !likeCon ? "" : Util.stringTrim(likeCon);
                // var type = Comm.getDropdownVal(dropdownId);
                // var sysctgid = $modal.find("input[type='hidden'][name='sysctgid']").val();
                return {
                    func:1
                    ,subfunc:4
                    ,column:"lastupdate"
                    ,asc:"desc"
                    ,type:"2"
                    ,checkstatus:"2"
                    ,likecon: likeCon
                    ,offset:params.offset
                    ,limit:params.limit
                };
            }
            ,columns : _zyTableColumns
        });


        if (!_trainRequireBrowseDlgInit) {
            var modalContext = {
                dlgSearchHandler: function () {
                    _reloadBtnClickHandler();
                }
                ,resetHandler:function () {
                    _resetHandler(true);
                }
            };
            _customProxy("#"+dlgId, "click", modalContext);
        }
        _trainRequireBrowseDlgInit = true;
    }

    var _surveyBrowseDlgInit = false;
    function _surveyBrowseDlg(selectBtnClickHandler) {
        var dlgId = "commonSurveyDlg1506738435351"
            , tableId = "commonSurveyDlg1506738435351_table"
            // , dropdownId = "commonTrainOrgDlg1506576454231_type_dropdown"
            , _reloadBtnClickHandler
            , _selectBtnClickHandler=function () {}
            ,$modal = _initModal(dlgId, true, true, null, 1040, 1040, 1035, "400px");
        _reloadBtnClickHandler = function () {
            $("#"+tableId).bootstrapTable("refresh");
        };

        if ($.isFunction(selectBtnClickHandler)) {
            _selectBtnClickHandler = function (e, value, row, index) {
                selectBtnClickHandler(row);
                $modal.modal("hide");
            }
        }


        var _resetHandler = function (haveReload) {
            $modal.find("input.form-control").val("").attr("title","");
            // $modal.find("input[name='sysctgid']").val("-1");
            // $modal.find("input[name='sysgradeid']").val("0");
            // _initDropdown(dropdownId, "0");
            // $("#"+dropdownId).find("span.default-val").html("全部").attr("val", "-1");
            if (haveReload === true) {
                _reloadBtnClickHandler();
            }
        };
        _resetHandler();//重置输入框，无重新加载

        // function _fileTyeFormatterHandler(value, row, index) {
        //     var type = Util.toString(value), typeStr=null;
        //     if(type === "0"){
        //         typeStr = "内部培训机构";
        //     }else if(type === "1") {
        //         typeStr = "外部培训机构";
        //     } else {
        //         typeStr = "-";
        //     }
        //     return typeStr;
        // }
        var _trainTypeFormatterHandler = function(value, row, index) {
            var name = "-";
            try {
                name = row["trainType"]["name"];
            } catch(e){}
            return Util.sprintf("<div>%s</div>",name);
        };
        var _selectFormatterHandler = function (value, row, index) {
            return '<span class="glyphicon glyphicon-ok finger text-609ee9 myselect" title="选择"></span>';
        };

        var _zyTableColumns = [
            // { checkbox:true, width: "10%" }
            { field : "questionnaireid",align : "center", title : "问卷编号"}
            ,{ field : "name",align : "center", title : "问卷名称"}
            // ,{ field : "trainType", align : "center", title : "培训类型",formatter: _trainTypeFormatterHandler }
            // ,{ field : "lecturername", align : "center", title : "讲师" }
            // ,{ field : "credit", align : "center", title : "学分"}
            ,{  align : "center", title : "选择", width:"10%", formatter: _selectFormatterHandler, events:{"click .myselect":_selectBtnClickHandler}}
        ];

        $("#"+tableId).bootstrapTable("destroy").bootstrapTable({
            url: Hredu.basePath + "/newquestionnaireservlet"
            ,pageNumber: 1
            ,pageSize: 5
            ,queryParams : function queryParams(params) {
                var likeCon = $modal.find("input[type='text'][name='lickcon']").val();
                likeCon = !likeCon ? "" : Util.stringTrim(likeCon);
                // var type = Comm.getDropdownVal(dropdownId);
                // var sysctgid = $modal.find("input[type='hidden'][name='sysctgid']").val();
                return {
                    func:11,
                    subfunc:5,
                    // questionnaireid:questionnaireid,
                    // name:likeCon,
                    likeCon:likeCon,
                    // data:date,
                    // sortcolumn:"createdate",
                    offset:params.offset,
                    limit:params.limit,
                    sortcolumn:"lastupdate",
                    sortdir:"asc"
                };
            }
            ,columns : _zyTableColumns
        });


        if (!_surveyBrowseDlgInit) {
            var modalContext = {
                dlgSearchHandler: function () {
                    _reloadBtnClickHandler();
                }
                ,resetHandler:function () {
                    _resetHandler(true);
                }
            };
            _customProxy("#"+dlgId, "click", modalContext);
        }
        _surveyBrowseDlgInit = true;
    }

    /**
     * bootstrap-table 刷新列表
     * @param tableID
     * @param idLength 操作数据数量
     * @private
     */
    function _refreshTableDataFunc(tableID,idLength){
        var tempList = $("#"+tableID);
        if(tempList && tempList.length){
            var options = tempList.bootstrapTable('getOptions');
            var pageNumber = 1;
            var totalrows = 0;
            var pageSize = 0;
            if(options){
                totalrows = options.totalRows;
                pageSize = options.pageSize;
                pageNumber = options.pageNumber;
                if((pageNumber - 1) * pageSize + idLength >= totalrows){
                    pageNumber = pageNumber - 1;
                }
                if(!pageNumber){
                    pageNumber = 1;
                }
            }
            tempList.bootstrapTable('refreshOptions', {pageNumber:pageNumber});
        }
    }


    /**
     * <p>
     * Title:_trainClassDateFormatter
     * <p>
     * Description: 培训班开课时间的格式化
     *
     * @author       taroFang@163.com
     * @date         2017年10月09日
     *
     * @param type 类型 1-培训班详情 2-首页培训班, 3-培训班列表
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @returns {string} 格式化后的时间
     * @private
     */
    function _trainClassDateFormatter(type, startDate, endDate) {
        type = !type ? "" : type.toString();
        var trainDateFormatter = "-";
        if (!startDate && !endDate) {
            if (type === "1") {
                trainDateFormatter = '<span class="text-color-babbbb">无限制</span>';
            } else if (type === "2") {
                trainDateFormatter = "<span class='comm-detail comm-time'>无限制</span>";
            } else if (type === "3") {
                trainDateFormatter = '<span>无限制</span>';
            }
        } else if (startDate && !endDate) {
            if (type === "1") {
                trainDateFormatter = '<span class="text-color-609ee9">%s&nbsp;开始</span>';
            } else if (type === "2") {
                trainDateFormatter = '<span class="comm-detail comm-time">%s&nbsp;开始</span>';
            } else if (type === "3") {
                trainDateFormatter = '<span>%s&nbsp;开始</span>';
            }
            trainDateFormatter = Util.sprintf(trainDateFormatter, startDate);
        } else if (!startDate && endDate) {
            if (type === "1") {
                trainDateFormatter = '<span class="text-color-609ee9">%s&nbsp;结束</span>';
            } else if (type === "2") {
                trainDateFormatter = '<span class="comm-detail comm-time">%s&nbsp;结束</span>';
            } else if (type === "3") {
                trainDateFormatter = '<span>%s&nbsp;结束</span>';
            }
            trainDateFormatter = Util.sprintf(trainDateFormatter, endDate);
        } else {
            if (type === "1") {
                trainDateFormatter =  '<span class="text-color-609ee9">%s</span>';
                trainDateFormatter += '<span class="text-color-babbbb">&nbsp;至&nbsp;</span>';
                trainDateFormatter += '<span class="text-color-609ee9">%s</span>';
            } else if (type === "2") {
                trainDateFormatter =  '<span class="comm-detail comm-time">%s</span>';
                trainDateFormatter += '<span class="comm-detail text-color-babbbb">&nbsp;至&nbsp;</span>';
                trainDateFormatter += '<span class="comm-detail comm-time">%s</span>';
            } else if (type === "3") {
                trainDateFormatter =  '<span>%s</span>';
                trainDateFormatter += '<span>&nbsp;~&nbsp;</span>';
                trainDateFormatter += '<span>%s</span>';
            }
            trainDateFormatter = Util.sprintf(trainDateFormatter, startDate, endDate);
        }
        return trainDateFormatter;
    }

    function _htmlTitleEscape(str) {
        if (!str) {
            return "";
        }
        str = str.replace("'", "\\'");
        str = str.replace('"', '\\"');
        return str;
    }


    function _uploadProgress() {
        var $dlg = $("#uploadProgreessDlg1510558635696");
        $dlg.removeClass("hidden");
    }

//======================================================================================================================
    comm.info = _info;
    comm.warn = _warn;
    comm.error = _error;
    comm.confirm = _confirm;
    comm.custom = _custom;
    comm.hide = _hide;
    comm.typeEnum = _typeEnum;
    comm.initDropdown = _initDropdown;
    comm.initDropdownMenuFunc = _initDropdownMenuFunc;
    comm.getDropdownVal = _getDropdownVal;
    comm.getDropdownText = _getDropdownText;
    comm.initModal = _initModal;
    comm.isValidImage = _isValidImage;
    comm.checkAjaxSuccessData = _checkAjaxSuccessData;
    comm.ajaxFail = _ajaxFail;
    comm.bootstrapTableResponseHandler = _bootstrapTableResponseHandler;
    comm.loadingShow = _loadingShow;
    comm.loadingHide = _loadingHide;
    comm.loadingShow2 = _loadingShow2;
    comm.loadingHide2 = _loadingHide2;
    comm.isValidExcel = _isValidExcel;
    comm.checkAjaxResponseHeaderHandler = _checkAjaxResponseHeaderHandler;
    comm.isValidFilenameLength = _isValidFilenameLength;
    comm.limitInputMaxLength = _limitInputMaxLength;
    comm.inputFocusBlur = _inputFocusBlur;
    comm.customProxy = _customProxy;
    comm.UEditorParse = _UEditorParse;
    comm.isValidPwd = _isValidPwd;
    comm.pwdInputKeyup = _pwdInputKeyup;
    comm.findLocationMapper = _findLocationMapper;
    comm.limitInput = _limitInput;
    comm.noSpecial = noSpecial;
    comm.getBootstrapTableSelectData = _getBootstrapTableSelectData;
    comm.arrToString = _arrToString;
    comm.scrollToTop = _scrollToTop;

    // comm.courseCategoryDlg = _courseCategoryDlg;
    comm.ztreeBowserDlg = _ztreeBowserDlg;
    comm.getZtreeCurrentNodeFullName = _getZtreeCurrentNodeFullName;
    comm.getZtreeSelectedNodes = _getZtreeSelectedNodes;
    comm.tdWidthHandler = _tdWidthHandler;
    comm.lecturerBrowseDlg = _lecturerBrowseDlg;
    comm.knowledgeBrowseDlg = _knowledgeBrowseDlg;
    comm.trainTypeBrowseDlg = _trainTypeBrowseDlg;
    comm.trainOrgBrowseDlg = _trainOrgBrowseDlg;
    comm.trainCourseBrowseDlg = _trainCourseBrowseDlg;
    comm.trainRequireBrowseDlg = _trainRequireBrowseDlg;
    comm.surveyBrowseDlg = _surveyBrowseDlg;


    comm.refreshTableDataFunc = _refreshTableDataFunc;


    comm.trainClassDateFormatter = _trainClassDateFormatter;
    comm.htmlTitleEscape = _htmlTitleEscape;

    comm.uploadProgress = _uploadProgress;
//======================================================================================================================
    //对bootstrapTable的补充
    //校核返回结果，如果session超时则弹框提示
    /*var _customBootstrapTableDefaults = {
        ajaxOptions: {haveLoadingMask: false}
        , paginationPreText: "上一页"
        , paginationNextText: "下一页"
        , paginationHAlign: "left"
        , contentType: "application/x-www-form-urlencoded; charset=utf-8"
        , locale: "zh-CN"
        , method: "post"
        , pagination: true // 分页
        , pageNumber: 1
        , pageSize: 10
        , striped: true
        , sidePagination: "server"
    };
    $.extend($.fn.bootstrapTable.defaults, _customBootstrapTableDefaults);*/
    //console.log($.fn.bootstrapTable.defaults.ajax);
})(Comm);


$(document).ready(function () {

});