var INDEX = INDEX || {};
(function (index) {

    function _initLibZtree() {
        var setting = {
            view: {
                selectedMulti: false
            },
            async: {
                enable: true,
                type: "post",
                dataType: "json",
                url:"/pack/fileServlet",
                autoParam:["root"],
                otherParam:{"func":"1"},
                dataFilter: filter
            },
            callback: {
                beforeClick: beforeClick,
                beforeAsync: beforeAsync,
                onAsyncError: onAsyncError,
                onAsyncSuccess: onAsyncSuccess
            }
        };

        $.fn.zTree.init($("#project_lib_ztree"), setting);
    }
    function _initJDKZtree() {
        var setting = {
            view: {
                selectedMulti: false
            },
            async: {
                enable: true,
                type: "post",
                dataType: "json",
                url:"/pack/fileServlet",
                autoParam:["root"],
                otherParam:{"func":"1"},
                dataFilter: filter
            },
            callback: {
                beforeClick: beforeClick,
                beforeAsync: beforeAsync,
                onAsyncError: onAsyncError,
                onAsyncSuccess: onAsyncSuccess
            }
        };

        $.fn.zTree.init($("#project_jdk_ztree"), setting);
    }
    function _initExtractZtree() {
        var setting = {
            view: {
                selectedMulti: false
            },
            async: {
                enable: true,
                type: "post",
                dataType: "json",
                url:"/pack/fileServlet",
                autoParam:["root"],
                otherParam:{"func":"1"},
                dataFilter: filter
            },
            callback: {
                // beforeClick: beforeClick,
                beforeAsync: beforeAsync,
                // onAsyncError: onAsyncError,
                // onAsyncSuccess: onAsyncSuccess
            }
        };

        $.fn.zTree.init($("#extract_position_ztree"), setting);
    }

    function _initZtree() {
        var setting = {
            view: {
                selectedMulti: false
            },
            async: {
                enable: true,
                type: "post",
                dataType: "json",
                url:"/pack/fileServlet",
                autoParam:["root"],
                otherParam:{"func":"1"},
                dataFilter: filter
            },
            callback: {
                beforeClick: beforeClick,
                beforeAsync: beforeAsync,
                onAsyncError: onAsyncError,
                onAsyncSuccess: onAsyncSuccess,
                onExpand:onExpand,
                beforeExpand:beforeExpand
            }
        };

        $.fn.zTree.init($("#file_ztree"), setting);
        $.fn.zTree.init($("#file_ztree2"), setting);

    }

    function filter(treeId, parentNode, childNodes) {
        if (!childNodes) return null;
        for (var i=0, l=childNodes.length; i<l; i++) {
            childNodes[i].name = childNodes[i].name.replace(/\.n/g, '.');
        }
        return childNodes.fileZtree;
    }
    function beforeClick(treeId, treeNode) {
        return true;
    }
    function beforeExpand(treeId, treeNode) {
        return true;
    }
    function beforeAsync(treeId, treeNode) {
        return true;
    }

    function onAsyncError(event, treeId, treeNode, XMLHttpRequest, textStatus, errorThrown) {

    }
    function onAsyncSuccess(event, treeId, treeNode, msg) {
        //console.log(treeNode.children);
    }
    function onExpand(event, treeId, treeNode) {

        var className = $("#"+treeNode.tId+"_span").attr('class');
        var name = null;
        if (className.indexOf('add') != -1 || className.indexOf('del') != -1){
            name = className.replace("node_name ","");
        }
        if (name) {
            var subNodes = treeNode.children;
            for (var i = 0; i < subNodes.length; i++) {
                $("#" + subNodes[i].tId + "_span").addClass(name);
            }
        }
        if (className.indexOf('update') != -1) {
            _setZtreeStyle(treeNode);
        } else if (className.indexOf('right') != -1) {
            _setZtreeStyle2(treeNode);
        }
    }

    function _getPath(treeNode, level) {
        var length = treeNode.level - level;
        if (length === 1) {
            return "/" + treeNode.name;
        } else if (length > 1) {
            // return "/" + treeNode.getParentNode().name + "/" + treeNode.name;
            var name = "/" + treeNode.name;
            var path = _getParentPath(treeNode.getParentNode(), level, name);
            return path;
        }
    }

    function _getParentPath(treeNode, level, name) {
        if (level === treeNode.level) {
            return name;
        } else {
            var name = "/" + treeNode.name + name;
            return _getParentPath(treeNode.getParentNode(), level, name);
        }
    }

    function _setZtreeStyle(treeNode) {
        var treeObj2 = $.fn.zTree.getZTreeObj("file_ztree2");
        var treeObj = $.fn.zTree.getZTreeObj("file_ztree");
        var nodes2 = treeObj2.getSelectedNodes();
        var nodes = treeObj.getSelectedNodes();
        var path = _getPath(treeNode, nodes[0].level);
        _contrastAjax(treeNode.root, nodes2[0].root + path, treeNode);
    }

    function _setZtreeStyle2(treeNode) {
        var treeObj2 = $.fn.zTree.getZTreeObj("file_ztree2");
        var treeObj = $.fn.zTree.getZTreeObj("file_ztree");
        var nodes2 = treeObj2.getSelectedNodes();
        var nodes = treeObj.getSelectedNodes();
        var path = _getPath(treeNode, nodes2[0].level);
        _contrastAjax(nodes[0].root + path, treeNode.root,"", treeNode);
    }

    function _compileBtnHandler() {
        $("#myModal").modal("show");
        //_initLibZtree();
    }

    function _compileSureHandler() {
        var treeObj = $.fn.zTree.getZTreeObj("file_ztree");//sourcePath
        var treeObj2 = $.fn.zTree.getZTreeObj("file_ztree2");//outPath
        var nodes = treeObj.getSelectedNodes();
        var nodes2 = treeObj2.getSelectedNodes();
        if (nodes.length == 0) {
            _showMsg("请选择要编译的文件!!!");
        } else {
            var treeNode = nodes[0];
            var treeNode2 = nodes2[0];
            // var flag = _getFileExtensions(treeNode.name) === 'java'?true:false
            // if (!flag) {
            //     _showMsg("请选择后缀为.java的文件");
            // }
            $("#myModal").modal('hide');
            var libPath = $("#lib").val();
            var jdkPath = $("#jdk").val();
            _compileAjax(treeNode, treeNode2, libPath, jdkPath);
        }
    }

    function _showMsg(text) {
        $("#error_box").removeClass("hidden");
        $("#error_msg").html('').html(text);
        setTimeout(function () {
            $("#error_box").addClass("hidden");
        }, 2000);
        return;
    }

    function _compileAjax(treeNode, treeNode2, libPath, jdkPath) {
        var outPath;
        if (!treeNode2) {
            outPath = "";
        } else {
            outPath = treeNode2.root;
        }
        $.ajax({
            url: "/pack/fileServlet"
            ,type:"POST"
            ,data: {
                name: treeNode.name,
                root: treeNode.root,
                func: 2,
                outPath: outPath,
                libPath: libPath,
                jdkPath: jdkPath
            }
            ,dataType:"json"
            ,success: function(result, textStatus, xhr) {
                var code = result.code;
                if (code === 1000){
                    $("#todoStatus").removeClass("vhidden");
                    $("#error_status").html('').html(result.msg);
                    setTimeout(function () {
                        $("#todoStatus").addClass("vhidden");
                        var treeObj2 = $.fn.zTree.getZTreeObj("file_ztree2");
                        var treeObj = $.fn.zTree.getZTreeObj("file_ztree");
                        var nodes2 = treeObj2.getSelectedNodes();
                        var nodes = treeObj.getSelectedNodes();
                        if (nodes2.length > 0) {
                            treeObj2.reAsyncChildNodes(nodes2[0], "refresh", false);
                        }else {
                            if (nodes.length > 0) {
                                treeObj.reAsyncChildNodes(nodes[0].getParentNode(), "refresh", false);
                            }
                        }
                    }, 2000);
                } else if (code === 1002) {
                    _showMsg(result.msg);
                } else {
                    $("#todoStatus").removeClass("vhidden");
                    $("#error_status").html('').html(result.msg);
                    setTimeout(function () {
                        $("#todoStatus").addClass("hidden");
                    }, 2000);
                }
            }
        });
    }

    function _packBtnHandler(act) {
        var treeObj = $.fn.zTree.getZTreeObj("file_ztree");
        var treeObj2 = $.fn.zTree.getZTreeObj("file_ztree2");
        var nodes = treeObj.getSelectedNodes();
        var nodes2 = treeObj2.getSelectedNodes();
        if (nodes.length === 0) {
            _showMsg("请选择要打包的文件!!!");
        } else {
            var treeNode = nodes[0];
            var treeNode2 = nodes2[0];
            _packAjax(treeNode, treeNode2, act);
        }
    }

    function _packAjax(treeNode, treeNode2, act) {
        var outPath;
        if (!treeNode2) {
            outPath = "";
        } else {
            outPath = treeNode2.root;
        }
        $.ajax({
            url: "/pack/fileServlet"
            ,type:"POST"
            ,data: {
                name: treeNode.name,
                root: treeNode.root,
                func: 3,
                outPath: outPath,
                act: act
            }
            ,dataType:"json"
            ,success: function(result, textStatus, xhr) {
                var code = result.code;
                if (code === 1000){
                    $("#todoStatus").removeClass("vhidden");
                    $("#error_status").html('').html(result.msg);
                    setTimeout(function () {
                        $("#todoStatus").addClass("vhidden");
                        var treeObj2 = $.fn.zTree.getZTreeObj("file_ztree2");
                        var treeObj = $.fn.zTree.getZTreeObj("file_ztree");
                        var nodes2 = treeObj2.getSelectedNodes();
                        var nodes = treeObj.getSelectedNodes();
                        if (nodes2.length > 0) {
                            treeObj2.reAsyncChildNodes(nodes2[0], "refresh", false);
                        }else {
                            if (nodes.length > 0) {
                                treeObj.reAsyncChildNodes(nodes[0].getParentNode(), "refresh", false);
                            }
                        }
                    }, 1500);
                } else if (code === 1002) {
                    _showMsg(result.msg);
                } else {
                    $("#todoStatus").removeClass("vhidden");
                    $("#error_status").html('').html(result.msg);
                    setTimeout(function () {
                        $("#todoStatus").addClass("hidden");
                    }, 1500);
                }
            }
        });
    }

    function _openLibBtnHandler(data) {
        if (data === 1) {
            _initLibZtree();
            $("#project_lib_ztree").parent().removeClass('hidden');
            $("#project_jdk_ztree").parent().addClass('hidden');
        } else {
            _initJDKZtree();
            $("#project_jdk_ztree").parent().removeClass('hidden');
            $("#project_lib_ztree").parent().addClass('hidden');
        }

    }
    function _resetBtnHandler(data) {
        if (data === 1) {
            $("#project_lib_ztree").parent().addClass('hidden');
        } else {
            $("#project_jdk_ztree").parent().addClass('hidden');
        }
    }
    function _reloadBtnHandler(data) {
        if (data === 1) {
            _initLibZtree();
        } else {
            _initJDKZtree();
        }
    }
    function _chooseLibBtnHandler(data) {
        if (data === 1) {
            var treeObj = $.fn.zTree.getZTreeObj("project_lib_ztree");
            var nodes = treeObj.getSelectedNodes();
            if (nodes.length === 0) {
                _showMsg("请选择项目所需类库目录!");
            }
            $("#lib").val('').val(nodes[0].root);
            $("#project_lib_ztree").parent().addClass('hidden');
        } else {
            var treeObj = $.fn.zTree.getZTreeObj("project_jdk_ztree");
            var nodes = treeObj.getSelectedNodes();
            if (nodes.length === 0) {
                _showMsg("请选择项目所需JDK目录!");
            }
            $("#jdk").val('').val(nodes[0].root);
            $("#project_jdk_ztree").parent().addClass('hidden');
        }
    }

    /**
     * 文件对比
     * @private
     */
    function _contrastBtnHandler() {

        $("#contrast").val(1);

        var treeObj = $.fn.zTree.getZTreeObj("file_ztree");
        var treeObj2 = $.fn.zTree.getZTreeObj("file_ztree2");
        var nodes = treeObj.getSelectedNodes();
        var nodes2 = treeObj2.getSelectedNodes();
        if (nodes.length === 0 || nodes2.length === 0) {
            _showMsg("请选择要对比的文件或文件夹")
        } else {
            var newPath = nodes[0].root;
            var oldPath = nodes2[0].root;
            _contrastAjax(newPath, oldPath);
        }
    }

    function _contrastAjax(newPath, oldPath, treeNode, treeNode2) {

        var treeObj2 = $.fn.zTree.getZTreeObj("file_ztree2");
        var treeObj = $.fn.zTree.getZTreeObj("file_ztree");
        var nodes, nodes2;
        if (treeNode) {
            nodes = treeNode;
        } else {
            nodes = treeObj.getSelectedNodes()[0];
        }
        if (treeNode2) {
            nodes2 = treeNode2;
        } else {
            nodes2 = treeObj2.getSelectedNodes()[0];
        }
        treeObj.expandNode(nodes, true, false, false, true);
        treeObj2.expandNode(nodes2, true, false, false, true);

        $.ajax({
            url: "/pack/fileServlet"
            ,type:"POST"
            ,data: {
                newPath: newPath,
                oldPath: oldPath,
                func: 4
            }
            ,dataType:"json"
            ,success: function(result, textStatus, xhr) {

                var left = result.newList;
                var right = result.oldList;
                if (left.length > 0) {
                    if (left[0].isContrast) {
                        _showMsg("请选择文件与文件对比或文件夹与文件夹对比");
                    }
                    if (left[0].isFile) {
                        $("#" + nodes.tId + "_span").addClass(left[0].class);
                    } else {
                        var subNodes = nodes.children;
                        for (var i = 0; i < left.length; i++) {
                            var name = left[i].name, className = left[i].class;
                            if (subNodes) {
                                for (var j = 0; j < subNodes.length; j++) {
                                    if (name === subNodes[j].name) {
                                        var subNode = $("#" + subNodes[j].tId + "_span");
                                        var oldClassName = subNode.attr('class');
                                        if (oldClassName.indexOf('add') != -1 || oldClassName.indexOf('update') != -1 || oldClassName.indexOf('del')!= -1) {
                                            subNode.removeClass('add');
                                            subNode.removeClass('update');
                                            subNode.removeClass('del');
                                        }
                                        subNode.addClass(className);
                                    }
                                }
                            }
                        }
                    }
                }

                if (right.length > 0) {
                    if (right[0].isContrast) {
                        _showMsg("请选择文件与文件对比或文件夹与文件夹对比");
                    }
                    if (right[0].isFile) {
                        $("#" + nodes2.tId + "_span").addClass(right[0].class);
                    } else {
                        var subNodes = nodes2.children;
                        for (var i = 0; i < right.length; i++) {
                            var name = right[i].name, className = right[i].class;
                            if (subNodes) {
                                for (var j = 0; j < subNodes.length; j++) {
                                    if (name === subNodes[j].name) {
                                        var subNode = $("#" + subNodes[j].tId + "_span");
                                        var oldClassName = subNode.attr('class');
                                        if (oldClassName.indexOf('add')!= -1 || oldClassName.indexOf('update')!= -1 || oldClassName.indexOf('del')!= -1) {
                                            subNode.removeClass('add');
                                            subNode.removeClass('update');
                                            subNode.removeClass('del');
                                        }
                                        subNode.addClass(className);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    function _openExtractFileZtree() {
        _initExtractZtree();
        $("#extract_position_ztree").parent().removeClass('hidden');
    }

    function _reloadExtractZtree() {
        _initExtractZtree();
    }
    function _chooseExtractZtree() {
        var posiTree = $.fn.zTree.getZTreeObj("extract_position_ztree")
            , posiNodes = posiTree.getSelectedNodes();
        if (posiNodes.length === 0) {
            _showMsg("请选择提取的文件或文件夹存放位置");
        } else {
            $("#extractPosition").val('').val(posiNodes[0].root);
            _resetExtractZtree();
        }
    }
    function _resetExtractZtree() {
        $("#extract_position_ztree").parent().addClass('hidden');
    }

    function _extractSureHandler() {
        var act = $("#extract_type").val()
            , sourceTree = $.fn.zTree.getZTreeObj("file_ztree")
            , sourceNodes = sourceTree.getSelectedNodes()
            , oldTree = $.fn.zTree.getZTreeObj("file_ztree2")
            , oldNodes = oldTree.getSelectedNodes()
            , newPath = $("#extractPosition").val()         //存放的位置
            , sourcePath = sourceNodes[0].root              //提起的文件位置
            ,  oldPath = oldNodes[0].root;                  //对比的位置（以前的文件）
        if (!newPath) {
            _showMsg("请选择提取的文件或文件夹存放位置");
        } else {
            $("#extractModal").modal('hide');
            if (act === '1') {
                _extractFunc(sourcePath, newPath, oldPath, 0);
            } else if (act === '2') {
                _extractFunc(oldPath, newPath, sourcePath, 0);
            } else if (act === '3') {
                _extractFunc(sourcePath, newPath, oldPath, 1);
            }

        }

    }

    function _extractBtnHandler(act) {
        var contrast = $("#contrast").val();
        if (contrast === '0') {
            _showMsg("请先对比文件！");
        } else {
            $("#extract_position_ztree").parent().addClass('hidden');
            $("#extractModal").modal('show');
            $("#extract_type").val('').val(act);
        }
    }

    function _extractFunc(sourcePath, newPath, oldPath, type) {
        $.ajax({
            url: "/pack/fileServlet"
            , type: "POST"
            , data: {
                sourcePath: sourcePath,
                newPath: newPath,
                oldPath: oldPath,
                func: 5,
                type: type
            }
            , dataType: "json"
            , success: function (result, textStatus, xhr) {
                console.log(result);
                var code = result.code;
                if (code === 1002) {
                    _showMsg(result.msg);
                } else if (code === 1000) {
                    $("#todoStatus").removeClass("vhidden");
                    $("#error_status").html('').html(result.msg);
                }
            }
            , error: function () {

            }
        });
    }

    function _getWeather() {
        $.ajax({
            url: "/pack/fileServlet"
            , type: "POST"
            , data: {
                func: 6
            }
            , dataType: "json"
            , success: function (result, textStatus, xhr) {
                console.log(result);
                var ip = result.ip;
                var api = "http://api.map.baidu.com/location/ip?ip="+ip+"&ak=fj9VKMgOiSRLrg2I5VBW5nOV1vRrq5VF&coor=bd09ll&callback=setPosition";
                $.getScript(api);
            }
            , error: function () {

            }
        });
    }

    /**
     * 百度定位接口回调函数
     * @param data 位置信息
     */
    function setPosition(data) {
        alert(data.content.address_detail.city);//data.content.address_detail.city 获得城市信息 具体请查看百度API文档
    }

    //=======================================
    index.initZtree = _initZtree;
    index.compileBtnHandler = _compileBtnHandler;
    index.packBtnHandler = _packBtnHandler;
    index.complieSureHandler = _compileSureHandler;
    index.openLibBtnHandler = _openLibBtnHandler;
    index.resetBtnHandler = _resetBtnHandler;
    index.reloadBtnHandler = _reloadBtnHandler;
    index.chooseLibBtnHandler = _chooseLibBtnHandler;
    index.contrastBtnHandler = _contrastBtnHandler;

    index.extractBtnHandler = _extractBtnHandler;
    index.openExtractFileZtree = _openExtractFileZtree;
    index.extractSureHandler = _extractSureHandler;
    index.reloadExtractZtree = _reloadExtractZtree;
    index.chooseExtractZtree = _chooseExtractZtree;
    index.resetExtractZtree = _resetExtractZtree;

    index.getWeather = _getWeather;


})(INDEX);
$(document).ready(function(){
    //INDEX.initZtree();
    INDEX.getWeather();
});