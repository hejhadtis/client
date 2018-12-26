<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>打包</title>

    <link href="${pageContext.request.contextPath}/plugin/bootstrap/3.3.5/css/bootstrap.min.css" type="text/css" rel="stylesheet"/>
    <link type="text/css" href="${pageContext.request.contextPath}/plugin/zTree_v3-master/css/zTreeStyle/zTreeStyle.css" rel="stylesheet">
    <link href="${pageContext.request.contextPath}/css/index.css" type="text/css" rel="stylesheet"/>

    <script type="text/javascript" src="${pageContext.request.contextPath}/plugin/jquery/1.9.1/jquery.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/plugin/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="${pageContext.request.contextPath}/plugin/zTree_v3-master/js/jquery.ztree.all.js"></script>
    <%--<script type="text/javascript" src="${pageContext.request.contextPath}/js/index.js"></script>--%>
    <script type="text/javascript" src="${pageContext.request.contextPath}/js/index.js"></script>

</head>
<body>
<div class="box">
    <div class="panel panel-info" style="margin: 20px;position: relative;">
        <div class="page-header">
            <h1 style="display: inline-block">项目打包</h1>
        </div>
        <div class="panel-body" style="display: flex;min-height: 350px;">
            <%-- 左边 --%>
            <div class="left-box">
                <div class="left-box-center">
                    <div class="title">
                        文件目录
                    </div>
                    <div class="file-ztree">
                        <ul class="ztree" id="file_ztree"></ul>
                    </div>
                </div>
            </div>
            <%-- 中间 --%>
            <div class="center-box">
                <div style="display: inline-grid;">
                    <button class="default-btn btn btn-primary" onclick="INDEX.compileBtnHandler();">编译java文件</button>
                    <button class="default-btn btn btn-primary" onclick="INDEX.packBtnHandler(1);">打包jar文件</button>
                    <button class="default-btn btn btn-primary" onclick="INDEX.packBtnHandler(2);">打包war文件</button>
                    <button class="default-btn btn btn-primary" onclick="INDEX.packBtnHandler(3);">打包zip文件</button>
                    <button class="default-btn btn btn-primary" onclick="INDEX.contrastBtnHandler();">文件对比</button>
                    <button class="default-btn btn btn-primary" onclick="INDEX.extractBtnHandler(1);">提取新增文件</button>
                    <button class="default-btn btn btn-primary" onclick="INDEX.extractBtnHandler(2);">提取删除文件</button>
                    <button class="default-btn btn btn-primary" onclick="INDEX.extractBtnHandler(3);">提取变更文件</button>
                    <input type="hidden" value="0" id="contrast">
                    <div class="error-box vhidden" id="todoStatus">
                        <span class="error-msg" id="error_status"></span>
                    </div>
                </div>
            </div>

            <%-- 右边 --%>
            <div class="right-box">
                <div class="left-box-center">
                    <div class="title">
                        文件生成目录
                    </div>
                    <div class="file-ztree">
                        <ul class="ztree" id="file_ztree2"></ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="hidden warning-box" id="error_box">
            <div class="alert alert-danger alert-btn" id="error_msg"></div>
        </div>

        <%-- 模态框 (编译文件)--%>
        <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                            &times;
                        </button>
                        <h4 class="modal-title" id="myModalLabel">
                            选择项目所需类库目录
                        </h4>
                    </div>
                    <div class="modal-body" style="max-height: 500px;overflow: auto;">
                        <form class="form-horizontal" role="form">
                            <div class="form-group" style="margin-top: 15px;">
                                <label for="lib" class="col-sm-2 control-label">类库</label>
                                <div class="col-sm-9 input-group">
                                    <input type="text" class="form-control" id="lib" style="border-top-right-radius: 0;border-bottom-right-radius: 0;">
                                    <span style="border-top-left-radius: 0;border-bottom-left-radius: 0;cursor: pointer;" class="input-group-addon" onclick="INDEX.openLibBtnHandler(1);">选择</span>
                                </div>
                                <label class="control-label col-sm-2"></label>
                                <div class="col-sm-9 file-lib-box hidden">
                                    <div style="padding: 5px;">
                                        <span class="btn btn-primary" onclick="INDEX.reloadBtnHandler(1); return false;">重新加载</span>&nbsp;&nbsp;
                                        <span class="btn btn-primary" onclick="INDEX.chooseLibBtnHandler(1); return false;">确定</span>&nbsp;&nbsp;
                                        <span class="btn btn-danger" onclick="INDEX.resetBtnHandler(1); return false;">取消</span>
                                    </div>
                                    <ul class="ztree" id="project_lib_ztree"></ul>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="jdk" class="col-sm-2 control-label">JDK</label>
                                <div class="col-sm-9 input-group">
                                    <input type="text" class="form-control" id="jdk" style="border-top-right-radius: 0;border-bottom-right-radius: 0;">
                                    <span style="border-top-left-radius: 0;border-bottom-left-radius: 0;cursor: pointer;" class="input-group-addon" onclick="INDEX.openLibBtnHandler(2);">选择</span>
                                </div>
                                <label class="control-label col-sm-2"></label>
                                <div class="col-sm-9 file-lib-box hidden">
                                    <div style="padding: 5px;">
                                        <span class="btn btn-primary" onclick="INDEX.reloadBtnHandler(2); return false;">重新加载</span>&nbsp;&nbsp;
                                        <span class="btn btn-primary" onclick="INDEX.chooseLibBtnHandler(2); return false;">确定</span>&nbsp;&nbsp;
                                        <span class="btn btn-danger" onclick="INDEX.resetBtnHandler(2); return false;">取消</span>
                                    </div>
                                    <ul class="ztree" id="project_jdk_ztree"></ul>
                                </div>
                            </div>
                        </form>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary" onclick="INDEX.complieSureHandler();">确定</button>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal -->
        </div>

        <%--模态框（提取文件）--%>
        <div class="modal fade" id="extractModal" tabindex="-1" role="dialog" aria-labelledby="extractModal" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">
                            &times;
                        </button>
                        <h4 class="modal-title">
                            选择提取后文件存放位置
                        </h4>
                    </div>
                    <div class="modal-body" style="max-height: 500px;overflow: auto;">
                        <input type="hidden" id="extract_type">
                        <form class="form-horizontal" role="form">
                            <div class="form-group" style="margin-top: 15px;">
                                <label for="lib" class="col-sm-2 control-label">目录</label>
                                <div class="col-sm-9 input-group">
                                    <input type="text" class="form-control" id="extractPosition" style="border-top-right-radius: 0;border-bottom-right-radius: 0;">
                                    <span style="border-top-left-radius: 0;border-bottom-left-radius: 0;cursor: pointer;" class="input-group-addon" onclick="INDEX.openExtractFileZtree();">选择</span>
                                </div>
                                <label class="control-label col-sm-2"></label>
                                <div class="col-sm-9 file-lib-box hidden">
                                    <div style="padding: 5px;">
                                        <span class="btn btn-primary" onclick="INDEX.reloadExtractZtree(); return false;">重新加载</span>&nbsp;&nbsp;
                                        <span class="btn btn-primary" onclick="INDEX.chooseExtractZtree(); return false;">确定</span>&nbsp;&nbsp;
                                        <span class="btn btn-danger" onclick="INDEX.resetExtractZtree(); return false;">取消</span>
                                    </div>
                                    <ul class="ztree" id="extract_position_ztree"></ul>
                                </div>
                            </div>
                        </form>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary" onclick="INDEX.extractSureHandler();">确定</button>
                    </div>
                </div><!-- /.modal-content -->
            </div><!-- /.modal -->
        </div>

    </div>

</div>

</body>
</html>
