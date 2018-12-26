var INDEX = INDEX || {};
(function (index) {
    var responseData;
    function sourceFilter(treeId, parentNode, childNodes) {
        responseData = childNodes.fileZtree;
        // if (responseData) {
        //     for(var i =0; i < responseData.length; i++) {
        //         if (responseData[i].class){
        //             console.log(treeId);
        //         }
        //     }
        // }
        // var treeObj = $.fn.zTree.getZTreeObj("file_ztree");
        // var nodes = treeObj.getNodes();
        // console.log(nodes);
        return childNodes.fileZtree;
    }

    function goalFilter(treeId, parentNode, childNodes) {
        return childNodes.fileZtree;
    }

    function sourceBeforeAsync(treeId, treeNode) {
        return true;
    }

    function sourceOnAsyncSuccess(event, treeId, treeNode) {
        // console.log(responseData);
        // console.log(event);
    }

    function sourceBeforeExpand(treeId, treeNode) {
        return true;
    }

    // var source,goal;
    function sourceOnExpand(event, treeId, treeNode) {
        // if (source) {
        //     var children = treeNode.children;
        //     for(var i =0; i < source.length; i++) {
        //         if (source[i].class){
        //             $("#" + children[i].tId + "_span").addClass(source[i].class);
        //         }
        //     }
        // }
    }

    function goalBeforeExpand(treeId, treeNode) {
        return true;
    }

    function goalOnExpand(event, treeId, treeNode) {
        // if (goal) {
        //     var children = treeNode.children;
        //     for(var i =0; i < goal.length; i++) {
        //         if (goal[i].class){
        //             $("#" + children[i].tId + "_span").addClass(goal[i].class);
        //         }
        //     }
        // }
    }

    function _initSourceZtree() {
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
                dataFilter: sourceFilter
            },
            callback: {
                // beforeClick: beforeClick,
                beforeAsync: sourceBeforeAsync,
                // onAsyncError: onAsyncError,
                onAsyncSuccess: sourceOnAsyncSuccess,
                onExpand:sourceOnExpand,
                beforeExpand:sourceBeforeExpand
            }
        };

        $.fn.zTree.init($("#file_ztree"), setting);
    }

    function _initGoalZtree() {
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
                dataFilter: goalFilter
            },
            callback: {
                // beforeClick: beforeClick,
                // beforeAsync: beforeAsync,
                // // onAsyncError: onAsyncError,
                // onAsyncSuccess: onAsyncSuccess,
                onExpand:goalOnExpand,
                beforeExpand:goalBeforeExpand
            }
        };

        $.fn.zTree.init($("#file_ztree2"), setting);
    }

    function _contrastBtnHandler() {
        var treeObj = $.fn.zTree.getZTreeObj("file_ztree");
        var treeObj2 = $.fn.zTree.getZTreeObj("file_ztree2");
        var nodes = treeObj.getSelectedNodes();
        var nodes2 = treeObj2.getSelectedNodes();
        if (nodes.length === 0 || nodes2.length === 0) {
            //_showMsg("请选择要对比的文件或文件夹")
        } else {
            var newPath = nodes[0].root;
            var oldPath = nodes2[0].root;
            _contrastAjax(newPath, oldPath);
        }
    }

    function _contrastAjax(newPath, oldPath) {

        // var treeObj2 = $.fn.zTree.getZTreeObj("file_ztree2");
        // var treeObj = $.fn.zTree.getZTreeObj("file_ztree");
        //
        // var nodes = treeObj.getSelectedNodes();
        // var nodes2 = treeObj2.getSelectedNodes();
        //
        // treeObj.expandNode(nodes[0], true, false, false, true);
        // treeObj2.expandNode(nodes2[0], true, false, false, true);

        $.ajax({
            url: "/pack/fileServlet"
            ,type:"POST"
            ,data: {
                newPath: newPath,
                oldPath: oldPath,
                func: 7
            }
            ,dataType:"json"
            ,success: function(result, textStatus, xhr) {

                // source = result.newList;
                // goal = result.oldList;

            }
        });
    }

    //======================================================================================

    index.initSourceZtree = _initSourceZtree;
    index.initGoalZtree = _initGoalZtree;

    index.contrastBtnHandler = _contrastBtnHandler;

})(INDEX);
$(document).ready(function(){
    INDEX.initSourceZtree();//源文件目录树形结构
    INDEX.initGoalZtree();//目标文件目录树形结构
});