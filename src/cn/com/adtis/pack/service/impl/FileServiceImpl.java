package cn.com.adtis.pack.service.impl;

import cn.com.adtis.fall.utils.HttpClientHelper;
import cn.com.adtis.pack.service.LmsService;
import cn.com.adtis.pack.util.IpUtil;
import cn.com.adtis.pack.util.JsonUtil;
import cn.com.adtis.pack.util.StringUtil;
import cn.com.adtis.pack.util.ZipUtil;
import org.apache.log4j.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class FileServiceImpl extends LmsService {

    private Logger logWriter = Logger.getLogger(FileServiceImpl.class.getName());

    @Override
    public void doService(HttpServletRequest request, HttpServletResponse response) throws Exception {
        int func = 0;
        String temp = request.getParameter("func");
        if (!StringUtil.isEmpty(temp)) {
            func = StringUtil.paresInt(temp, 0);
            if (logWriter.isDebugEnabled()) {
                logWriter.debug("[FileServiceImpl][doService] func:"
                        + func);
            }
            switch (func) {
                case 1:         //获取电脑根目录
                    initFileRootsPath(request, response);
                    break;
                case 2:
                    compileFile(request, response);
                    break;
                case 3:
                    packFile(request, response);
                    break;
                case 4:
                    contrastFile(request, response);
                    break;
                case 5:
                    extractFile(request, response);
                    break;
                case 6:
                    getWeather(request, response);
                    break;
                default:
                    break;
            }
        }
    }

    private void getWeather(HttpServletRequest request, HttpServletResponse response) throws IOException{
        if (logWriter.isDebugEnabled()) {
            logWriter.debug("[FileServiceImpl][getWeather] in");
        }
        PrintWriter pw = null;
        try {
            pw = response.getWriter();
            String resultStr = doGetWeather(request, response);
            pw.write(resultStr);
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][getWeather] JSONresultStr="
                                + resultStr);
            }
            pw.flush();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (pw != null) {
                pw.close();
            }
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][getWeather] out");
            }
        }
    }

    private String doGetWeather(HttpServletRequest request, HttpServletResponse response) {
        Map<String, Object> resMap = new HashMap<>();
        try {
            String ipAddress = IpUtil.getIp(request);
            resMap.put("ip", ipAddress);
        } catch (Exception e) {

        } finally {
            return JsonUtil.getJsonFromObject(resMap);
        }
    }

    private void extractFile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (logWriter.isDebugEnabled()) {
            logWriter.debug("[FileServiceImpl][doExtractFile] in");
        }
        PrintWriter pw = null;
        try {
            pw = response.getWriter();
            String resultStr = doExtractFile(request, response);
            pw.write(resultStr);
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][doExtractFile] JSONresultStr="
                                + resultStr);
            }
            pw.flush();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (pw != null) {
                pw.close();
            }
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][doExtractFile] out");
            }
        }
    }

    private String doExtractFile(HttpServletRequest request, HttpServletResponse response) {
        Map<String, Object> resMap = new HashMap<>();
        String sourcePath = request.getParameter("sourcePath");     //提起的文件位置
        String newPath = request.getParameter("newPath");           //存放的位置
        String oldPath = request.getParameter("oldPath");           //对比的位置（以前的文件）
        int type = StringUtil.paresInt(request.getParameter("type"), 0);
        try {
            File sourceFile = new File(sourcePath);
            if (StringUtil.isEmpty(sourcePath) || sourceFile == null) {
                resMap.put("code", 1002);
                resMap.put("msg", "请选择要提取的文件或文件夹");
                return JsonUtil.getJsonFromObject(resMap);
            }

            File destFile = new File(newPath);
            if (StringUtil.isEmpty(newPath) || destFile == null) {
                resMap.put("code", 1002);
                resMap.put("msg", "请选择要提取的文件或文件夹存放路径");
                return JsonUtil.getJsonFromObject(resMap);
            }

            File oldFile = new File(oldPath);
            if (StringUtil.isEmpty(oldPath) || oldFile == null) {
                resMap.put("code", 1002);
                resMap.put("msg", "请先对比文件或文件夹");
                return JsonUtil.getJsonFromObject(resMap);
            }
            if (type == 1) {//提取变更文件（新增、更新）
                if (sourceFile.isFile()) {
                    if (sourceFile.getName().equals(oldFile.getName())) {
                        if (sourceFile.lastModified() != oldFile.lastModified()) {
                            copyFile(sourcePath, newPath + File.separator + sourceFile.getName());
                            resMap.put("code", 1000);
                            resMap.put("msg", "提取文件成功");
                        }
                    } else {
                        copyFile(sourcePath, newPath + File.separator + sourceFile.getName());
                        resMap.put("code", 1000);
                        resMap.put("msg", "提取文件成功");
                    }
                } else {
                    //copyDir(sourcePath, newPath + File.separator + sourceFile.getName());
                    //extractFileWithAddAndUpdate(sourcePath, oldPath);
                    List<String> newList = getParentName(new File(sourcePath));
                    List<String> oldList = getParentName(new File(oldPath));

                    List<String> newSameNames = getSameNameFile(newList, oldList);
                    List<String> oldSameNames = getSameNameFile(oldList, newList);

                    List<String> list = new ArrayList<>();//没有变更过的文件或文件夹相对路径

                    for (String newSameName : newSameNames) {
                        File newFile = new File(sourcePath + File.separator + newSameName);
                        for (String oldSameName : oldSameNames) {
                            File oldFile1 = new File(oldPath + File.separator + oldSameName);
                            if (newFile.lastModified() == oldFile1.lastModified() && newSameName.equals(oldSameName)) {
                                list.add(newSameName);
                            }
                        }
                    }

                    List<String> newFileList = removeSameName(newList, list);
                    File desFile = new File(newPath + File.separator + sourceFile.getName());
                    if (!desFile.exists()) {
                        desFile.mkdir();
                    }
                    for (String s : newFileList) {
                        String source = sourcePath + File.separator + s;
                        String dest = desFile.getAbsolutePath() + File.separator + s;
                        File dFile = new File(dest);
                        File sFile = new File(source);
                        if (!dFile.exists()) {
                            if (sFile.isDirectory()) {
                                dFile.mkdir();
                            } else {
                                copyFile(source, dest);
                            }
                        }
                    }
                    resMap.put("code", 1000);
                    resMap.put("msg", "提取文件成功");
                }
            } else {//提取新增或者删除文件
                if (sourceFile.isFile()) {
                    if (!sourceFile.getName().equals(oldFile.getName())) {
                        copyFile(sourcePath, newPath + File.separator + sourceFile.getName());
                        resMap.put("code", 1000);
                        resMap.put("msg", "提取文件成功");
                    } else {
                        resMap.put("code", 1002);
                        resMap.put("msg", "当前对比中暂无新增文件或文件夹可以提取");
                    }
                } else {
                    extractFileWithOutOtherFile(sourcePath, newPath, oldPath, resMap);
                    extractFileWithOtherFile(sourcePath, newPath, oldPath, resMap);
                }
            }

        } catch (Exception ex) {
            ex.printStackTrace();
            resMap.put("code", 1002);
            resMap.put("msg", "提取文件失败");
        } finally {
            return JsonUtil.getJsonFromObject(resMap);
        }
    }

    private List<String> getParentName(File file) {
        List<String> list = new ArrayList<>();
        return getParentNames(list, file, "");
    }

    private List<String> getParentNames(List<String> list, File file, String name) {
        if (file.exists()) {
            File [] files = file.listFiles();
            for (File file1 : files) {
                String parentName = "";
                if (StringUtil.isEmpty(name)) {
                    parentName = file1.getName();
                } else {
                    parentName = name + File.separator + file1.getName();
                }
                list.add(parentName);
                if (file1.isDirectory()) {
                    getParentNames(list, file1, parentName);
                }
            }
        }
        return list;
    }

    /**
     * 提取选中节点下面修改文档中的新增文件或文件夹
     * @param sourcePath
     * @param newPath
     * @param oldPath
     * @param resMap
     */
    private void extractFileWithOtherFile(String sourcePath, String newPath, String oldPath, Map<String, Object> resMap) {
        File sourceFile = new File(sourcePath);
        File oldFile = new File(oldPath);
        File [] f1 = sourceFile.listFiles();
        File [] f2 = oldFile.listFiles();
        List<String> newFilesName = getFileNameList(f1);
        List<String> oldFilesName = getFileNameList(f2);
        List<String> sameFiles = getSameNameFile(newFilesName, oldFilesName);
        if (sameFiles.size() > 0) {

            for (String sameFile : sameFiles) {
                File file = new File(sourcePath + File.separator + sameFile);
                if (file.isDirectory()) {
                    String source = sourcePath + File.separator + sameFile;
                    String dest = newPath + File.separator + sourceFile.getName();
                    File destFile = new File(dest);
                    if (!destFile.exists()) {
                        destFile.mkdir();
                    }
                    String old = oldPath + File.separator + sameFile;
                    
                    extractFileWithOutOtherFile(source, dest, old, resMap);
                    extractFileWithOtherFile(source, dest, old, resMap);

                }
            }
        }
    }

    /**
     * 提取当前选中的节点下面新增的文件或文件夹
     * @param sourcePath
     * @param newPath
     * @param oldPath
     * @param resMap
     */
    private void extractFileWithOutOtherFile(String sourcePath, String newPath, String oldPath, Map<String, Object> resMap) {

        File sourceFile = new File(sourcePath);
        File oldFile = new File(oldPath);
        File [] f1 = sourceFile.listFiles();
        File [] f2 = oldFile.listFiles();
        List<String> newFilesName = getFileNameList(f1);
        List<String> oldFilesName = getFileNameList(f2);
        List<String> newDefs = getDiffenrceNameFile(oldFilesName, newFilesName);
        if (newDefs.size() > 0) {
            File rootFile = new File(newPath + File.separator + sourceFile.getName());
            if (!rootFile.exists()) {
                rootFile.mkdir();
            }
            newPath = rootFile.getAbsolutePath();
            for (String newDef : newDefs) {
                String path = sourcePath + File.separator + newDef;
                File file = new File(path);
                if (file.exists()) {
                    if (file.isFile()) {
                        copyFile(path, newPath + File.separator + newDef);
                    } else {
                        copyDir(path, newPath + File.separator + newDef);
                    }
                    resMap.put("code", 1000);
                    resMap.put("msg", "提取文件成功");
                } else {
                    resMap.put("code", 1002);
                    resMap.put("msg", "当前对比中暂无新增文件或文件夹可以提取");
                }
            }
        }
    }

    private void contrastFile(HttpServletRequest request, HttpServletResponse response) throws IOException{
        if (logWriter.isDebugEnabled()) {
            logWriter.debug("[FileServiceImpl][contrastFile] in");
        }
        PrintWriter pw = null;
        try {
            pw = response.getWriter();
            String resultStr = doContrastFile(request, response);
            pw.write(resultStr);
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][contrastFile] JSONresultStr="
                                + resultStr);
            }
            pw.flush();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (pw != null) {
                pw.close();
            }
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][contrastFile] out");
            }
        }
    }

    private String doContrastFile(HttpServletRequest request, HttpServletResponse response) {
        Map<String, Object> resMap = new HashMap<>();
        String newPath = request.getParameter("newPath");
        String oldPath = request.getParameter("oldPath");
        try {
            if (StringUtil.isEmpty(newPath) || StringUtil.isEmpty(oldPath)) {
                resMap.put("code", 1002);
                resMap.put("msg", "请选择要对比的文件或文件夹");
                return JsonUtil.getJsonFromObject(resMap);
            }

            File newFile = new File(newPath);
            File oldFile = new File(oldPath);
            if (newFile == null || oldFile == null) {
                resMap.put("code", 1002);
                resMap.put("msg", "请选择要对比的文件或文件夹");
                return JsonUtil.getJsonFromObject(resMap);
            }

            compareTo(newPath, oldPath, resMap);

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            return JsonUtil.getJsonFromObject(resMap);
        }
    }

    private void compareTo(String newPath, String oldPath, Map<String, Object> resMap) {
        List<Map<String, Object>> newList = new ArrayList<>();
        List<Map<String, Object>> oldList = new ArrayList<>();
        File newFile = new File(newPath);
        File oldFile = new File(oldPath);
        compareTo(newFile, newList, oldFile, oldList);
        resMap.put("newList", newList);
        resMap.put("oldList", oldList);
    }

    private void compareTo(File newFile, List<Map<String, Object>> newList, File oldFile, List<Map<String, Object>> oldList) {
        if (newFile.isFile() && oldFile.isFile()) {
            if (newFile.getName().equals(oldFile.getName())) {
                if (newFile.lastModified() != oldFile.lastModified()) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", newFile.getName());
                    map.put("class", "update");
                    map.put("isParent", false);
                    map.put("isFile", true);
                    newList.add(map);
                }
            } else {
                Map<String, Object> newMap = new HashMap<>();
                newMap.put("name", newFile.getName());
                newMap.put("class", "add");
                newMap.put("isParent", false);
                newMap.put("isFile", true);
                newList.add(newMap);

                Map<String, Object> oldMap = new HashMap<>();
                oldMap.put("name", oldFile.getName());
                oldMap.put("class", "del");
                oldMap.put("isParent", false);
                oldMap.put("isFile", true);
                oldList.add(oldMap);
            }
        } else if (newFile.isFile() && oldFile.isDirectory()) {

            Map<String, Object> newMap = new HashMap<>();
            newMap.put("isContrast", true);
            newList.add(newMap);

        } else if (newFile.isDirectory() && oldFile.isFile()) {

            Map<String, Object> oldMap = new HashMap<>();
            oldMap.put("isContrast", true);
            oldList.add(oldMap);

        } else {
            File [] f1 = newFile.listFiles();
            File [] f2 = oldFile.listFiles();
            List<String> newFilesName = getFileNameList(f1);
            List<String> oldFilesName = getFileNameList(f2);

            //查询出新添加的和删除的
            List<String> newDefs = getDiffenrceNameFile(oldFilesName, newFilesName);
            List<String> oldDefs = getDiffenrceNameFile(newFilesName, oldFilesName);
            setFileZtreeAddAndDelStyle(newFile, newList, newDefs, "add");
            setFileZtreeAddAndDelStyle(oldFile, oldList, oldDefs, "del");

            //查询出修改的(相同名称的文件夹)
            List<String> sameFiles = getSameNameFile(newFilesName, oldFilesName);
            setSameNameFileZtreeStyle(newFile, oldFile, newList, sameFiles, "update");
            setSameNameFileZtreeStyle(oldFile, newFile, oldList, sameFiles, "right");
        }
    }

    private void setSameNameFileZtreeStyle(File newFile, File oldFile, List<Map<String, Object>> newList, List<String> sameNames, String className) {
        File [] news = newFile.listFiles();
        File [] olds = oldFile.listFiles();
        List<File> fileList1 = new ArrayList<>();
        List<File> fileList2 = new ArrayList<>();
        for (String name : sameNames) {
            for (File nFile : news) {
                if (name.equals(nFile.getName())) {
                    fileList1.add(nFile);
                }
            }
            for (File oFile : olds) {
                if (name.equals(oFile.getName())) {
                    fileList2.add(oFile);
                }
            }
        }
        for (File file1 : fileList1) {
            for (File file2 : fileList2) {
                if (file1.getName().equals(file2.getName())) {
                    if (file1.lastModified() != file2.lastModified()) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("name", file1.getName());
                        map.put("class", className);
                        newList.add(map);
                    }
                }
            }
        }
    }

    private void setFileZtreeAddAndDelStyle(File file, List<Map<String, Object>> list, List<String> defName, String className) {
        File [] files = file.listFiles();
        for (String name : defName) {
            for (File file1 : files) {
                if (name.equals(file1.getName())) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", name);
                    map.put("class", className);
                    if (file1.isDirectory()) {
                        map.put("isParent", true);
                    } else {
                        map.put("isParent", false);
                    }
                    list.add(map);
                }
            }
        }
    }

    private void initFileRootsPath(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (logWriter.isDebugEnabled()) {
            logWriter.debug("[FileServiceImpl][initFilePath] in");
        }
        PrintWriter pw = null;
        try {
            pw = response.getWriter();
            String resultStr = getFileRootsPath(request, response);
            pw.write(resultStr);
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][initFilePath] JSONresultStr="
                                + resultStr);
            }
            pw.flush();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (pw != null) {
                pw.close();
            }
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][initFilePath] out");
            }
        }
    }

    private String getFileRootsPath(HttpServletRequest request, HttpServletResponse response) {
        Map<String,Object> resultMap = new HashMap<String,Object>();
        List<Map<String, Object>> resList = new ArrayList<>();
        String root = request.getParameter("root");
        try {
            if (StringUtil.isEmpty(root)) {//获取根目录
                File[] files = File.listRoots();
                if (files != null) {
                    Map<String, Object> map = null;
                    for (File file : files) {
                        map = new HashMap<>();
                        if (file.isDirectory()) {
                            if (isHasFile(file)) {
                                map.put("name", file.getAbsolutePath().replaceAll("\\\\", "/"));
                                if (file.listFiles() != null) {
                                    map.put("isParent", true);
                                } else {
                                    map.put("isParent", false);
                                }
                                map.put("root", file.getAbsolutePath());
                                resList.add(map);
                            }
                        }
                    }
                }
            } else {//根据目录查询下级目录和文件
                File file = new File(root);
                if (file.isDirectory()) {
                    File[] files = file.listFiles();
                    if (null != files) {
                        Map<String, Object> resMap = null;
                        for (File file1 : files) {
                            resMap = new HashMap<>();
                            resMap.put("name", file1.getName());
                            if (file1.listFiles() != null) {
                                resMap.put("isParent", true);
                            } else {
                                resMap.put("isParent", false);
                            }
                            resMap.put("root", file1.getAbsolutePath());
                            resList.add(resMap);
                        }
                    }
                }
            }
            resultMap.put("fileZtree", resList);
        } catch (Exception e) {
            logWriter.debug(e);
            e.printStackTrace();
        }
        return JsonUtil.getJsonFromObject(resultMap);
    }

    /**
     * 判断文件夹下面是否有文件存在  true-有，false-没有
     * @return
     */
    private boolean isHasFile (File file) {
        if (file == null) {
            return false;
        }
        File [] files = file.listFiles();
        if (files == null) {
            return false;
        }
        return true;
    }

    private void compileFile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (logWriter.isDebugEnabled()) {
            logWriter.debug("[FileServiceImpl][compileFile] in");
        }
        PrintWriter pw = null;
        try {
            pw = response.getWriter();
            String resultStr = doCompileFile(request, response);
            pw.write(resultStr);
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][compileFile] JSONresultStr="
                                + resultStr);
            }
            pw.flush();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (pw != null) {
                pw.close();
            }
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][compileFile] out");
            }
        }
    }

    private String doCompileFile(HttpServletRequest request, HttpServletResponse response) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        String name = request.getParameter("name");
        String root = request.getParameter("root");//目标文件路径
        String outPath = request.getParameter("outPath");//编译后文件存放路径
        String libPath = request.getParameter("libPath");//项目所需类库路径
        String jdkPath = request.getParameter("jdkPath");//项目所需JDK路径
        List<String> list = null;
        List<String> jdkList = null;
        StringBuffer buffer = new StringBuffer();
        try {
            if (StringUtil.isEmpty(root)) {
                logWriter.debug("root is not null");
                resultMap.put("code",1002);
                resultMap.put("msg","请选择要编译的文件或文件夹");
                return JsonUtil.getJsonFromObject(resultMap);
            }
            File file = new File(root);
            if (file == null) {
                resultMap.put("code",1002);
                resultMap.put("msg","请选择要编译的文件或文件夹");
                return JsonUtil.getJsonFromObject(resultMap);
            }
            if (!file.isDirectory()) { //文件
                if (!isJavaFile(file)) {//判断文件是否是java文件
                    resultMap.put("code",1002);
                    resultMap.put("msg","请选择后缀名是.java的文件");
                    return JsonUtil.getJsonFromObject(resultMap);
                }
            }
            if (file.isDirectory()) { //文件夹
                //判断当前文件夹下面是否包含java文件
                list = getAllJavaFileAbsolutePath(file);//判断所选择的要编译的目录下面是否有java文件
                if (list.size() == 0) {
                    resultMap.put("code",1002);
                    resultMap.put("msg","请确认文件夹下是否包含.java文件");
                    return JsonUtil.getJsonFromObject(resultMap);
                }
            }
            if (StringUtil.isEmpty(libPath)) {
                resultMap.put("code",1002);
                resultMap.put("msg","请选择项目所需类库目录!");
                return JsonUtil.getJsonFromObject(resultMap);
            }

            String classpath = getClassPathFileAbsolutePath(libPath);
            if (StringUtil.isEmpty(classpath)) {
                resultMap.put("code",1002);
                resultMap.put("msg","请选择项目所需类库目录!");
                return JsonUtil.getJsonFromObject(resultMap);
            }

            if (StringUtil.isEmpty(jdkPath)) {
                resultMap.put("code",1002);
                resultMap.put("msg","请选择项目所需JDK目录!");
                return JsonUtil.getJsonFromObject(resultMap);
            }

            File jdkFile = new File(jdkPath);
            if (jdkFile.isFile()) {
                if (!"javac.exe".equals(jdkFile.getName())) {
                    resultMap.put("code",1002);
                    resultMap.put("msg","请选择项目所需JDK目录!");
                    return JsonUtil.getJsonFromObject(resultMap);
                }
            } else {
                jdkList = getJavacAbsolutePath(jdkFile);//获取javac.exe绝对路径
                if (jdkList.size() == 0) {
                    resultMap.put("code",1002);
                    resultMap.put("msg","请选择项目所需JDK目录!");
                    return JsonUtil.getJsonFromObject(resultMap);
                }
                jdkPath = jdkList.get(0);
            }

            buffer.append("javac -encoding utf-8 -cp ")
                    .append(classpath).append(". ");
            if (!StringUtil.isEmpty(outPath)) {
                buffer.append("-d ").append(outPath).append(" ");
            }
            String sourceFilePath = getSourceFileAbsolutePath(root);//获取要编译的java文件绝对路径

            buffer.append(sourceFilePath);

            Process process = Runtime.getRuntime().exec(jdkPath);//启动javac.exe程序
            if (process != null) {
                Runtime.getRuntime().exec(buffer.toString());//执行编译
                resultMap.put("code", 1000);
                resultMap.put("msg", "执行成功");
            } else {
                resultMap.put("code", 1001);
                resultMap.put("msg", "执行失败");
            }

        } catch (Exception ex) {
            logWriter.debug(ex.getMessage());
            ex.printStackTrace();
            resultMap.put("code", 1001);
            resultMap.put("msg", "执行失败");
        } finally {
            return JsonUtil.getJsonFromObject(resultMap);
        }

    }

    private List<String> getJavacAbsolutePath(File file) {
        List<String> fileList = new ArrayList<>();
        return getJavacAbsolutePath(file, fileList);
    }

    private void packFile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int act = 0;
        try {
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][packFile] in");
            }
            String temp = request.getParameter("act");
            if (temp != null) {
                act = Integer.parseInt(temp);
                if (logWriter.isDebugEnabled()) {
                    logWriter
                            .debug("[FileServiceImpl][packFile] act:"
                                    + act);
                }
                switch (act) {
                    case 1:
                        packJarFile(request, response);
                        break;
                    case 2:
                        packWarFile(request, response);
                        break;
                    case 3:
                        packZipFile(request, response);
                        break;
                    default:
                        break;
                }
            }
        } finally {
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][packFile] out");
            }
        }
    }

    private void packZipFile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (logWriter.isDebugEnabled()) {
            logWriter.debug("[FileServiceImpl][packZipFile] in");
        }
        PrintWriter pw = null;
        try {
            pw = response.getWriter();
            String resultStr = doPackZipFile(request, response);
            pw.write(resultStr);
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][packZipFile] JSONresultStr="
                                + resultStr);
            }
            pw.flush();
        } finally {
            if (pw != null) {
                pw.close();
            }
            if (logWriter.isDebugEnabled()) {
                logWriter.debug("[FileServiceImpl][packZipFile] out");
            }
        }
    }

    private String doPackZipFile(HttpServletRequest request, HttpServletResponse response) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        String fileName = request.getParameter("name");
        String zipFilePath = request.getParameter("outPath");
        String sourceFilePath = request.getParameter("root");
        try {
            File sourceFile = new File(sourceFilePath);
            if (!sourceFile.exists() || StringUtil.isEmpty(fileName)) {
                resultMap.put("code",1002);
                resultMap.put("msg","请选择要打包的文件或文件夹");
                return JsonUtil.getJsonFromObject(resultMap);
            }

            if (StringUtil.isEmpty(zipFilePath)) {
                zipFilePath = sourceFilePath.replaceAll(fileName, "");
            } else {
                zipFilePath = zipFilePath + File.separator;
            }

            if (sourceFile.isDirectory()) {
                fileName = fileName + ".zip";
            } else {
                fileName = fileName.substring(0, fileName.lastIndexOf(".")) + ".zip";
            }

            boolean flag = ZipUtil.toZip(sourceFilePath, zipFilePath + fileName, true);
            if (flag) {
                resultMap.put("code", 1000);
                resultMap.put("msg", "执行成功");
            } else {
                resultMap.put("code", 1001);
                resultMap.put("msg", "执行失败");
            }

        } catch (Exception ex) {
            logWriter.debug(ex.getMessage());
            ex.printStackTrace();
        } finally {
            return JsonUtil.getJsonFromObject(resultMap);
        }

    }

    private void packWarFile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (logWriter.isDebugEnabled()) {
            logWriter.debug("[FileServiceImpl][packWarFile] in");
        }
        PrintWriter pw = null;
        try {
            pw = response.getWriter();
            String resultStr = doPackWarFile(request, response);
            pw.write(resultStr);
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][packWarFile] JSONresultStr="
                                + resultStr);
            }
            pw.flush();
        } finally {
            if (pw != null) {
                pw.close();
            }
            if (logWriter.isDebugEnabled()) {
                logWriter.debug("[FileServiceImpl][packWarFile] out");
            }
        }
    }

    private String doPackWarFile(HttpServletRequest request, HttpServletResponse response) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        String name = request.getParameter("name");
        String outPath = request.getParameter("outPath");
        String path = request.getParameter("root");
        Process process = null;
        StringBuffer buffer = new StringBuffer();
        try {
            buffer.append("jar -cvf ");
            if (StringUtil.isEmpty(path) || StringUtil.isEmpty(name)) {
                resultMap.put("code",1002);
                resultMap.put("msg","请选择要打包的文件或文件夹");
                return JsonUtil.getJsonFromObject(resultMap);
            }

            File file = new File(path);
            if (file == null) {
                resultMap.put("code",1002);
                resultMap.put("msg","文件或文件夹不存在");
                return JsonUtil.getJsonFromObject(resultMap);
            }

            if (StringUtil.isEmpty(outPath)) {
                outPath = path.replaceAll(name,"");
            } else {
                outPath = outPath + File.separator;
            }

            if (file.isDirectory()) {
                name = name + ".war";
            } else {
                name = name.substring(0, name.lastIndexOf(".")) + ".war";//用于打包之后的名称
            }


            buffer.append(outPath).append(name).append(" ").append(path);

            process = Runtime.getRuntime().exec(buffer.toString());

            if (process != null) {
                resultMap.put("code",1000);
                resultMap.put("msg","执行成功");
            } else {
                resultMap.put("code",1001);
                resultMap.put("msg","执行失败");
            }
        } catch (Exception ex) {
            logWriter.debug(ex.getMessage());
            resultMap.put("code", 1002);
            resultMap.put("code", "发生未知错误，稍后再试");
            ex.printStackTrace();
        } finally {
            return JsonUtil.getJsonFromObject(resultMap);
        }

    }

    private void packJarFile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (logWriter.isDebugEnabled()) {
            logWriter.debug("[FileServiceImpl][packJarFile] in");
        }
        PrintWriter pw = null;
        try {
            pw = response.getWriter();
            String resultStr = doPackJarFile(request, response);
            pw.write(resultStr);
            if (logWriter.isDebugEnabled()) {
                logWriter
                        .debug("[FileServiceImpl][packJarFile] JSONresultStr="
                                + resultStr);
            }
            pw.flush();
        } finally {
            if (pw != null) {
                pw.close();
            }
            if (logWriter.isDebugEnabled()) {
                logWriter.debug("[FileServiceImpl][packJarFile] out");
            }
        }
    }

    private String doPackJarFile(HttpServletRequest request, HttpServletResponse response) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        String name = request.getParameter("name");
        String outPath = request.getParameter("outPath");
        String path = request.getParameter("root");
        Process process = null;
        StringBuffer buffer = new StringBuffer();
        try {
            buffer.append("jar -cvf ");
            if (StringUtil.isEmpty(path) || StringUtil.isEmpty(name)) {
                resultMap.put("code",1002);
                resultMap.put("msg","请选择要打包的文件或文件夹");
                return JsonUtil.getJsonFromObject(resultMap);
            }

            File file = new File(path);
            if (file == null) {
                resultMap.put("code",1002);
                resultMap.put("msg","文件或文件夹不存在");
                return JsonUtil.getJsonFromObject(resultMap);
            }

            if (StringUtil.isEmpty(outPath)) {
                outPath = path.replaceAll(name,"");
            } else {
                outPath = outPath + File.separator;
            }

            if (file.isDirectory()) {
                name = name + ".jar";
            } else {
                name = name.substring(0, name.lastIndexOf(".")) + ".jar";//用于打包之后的名称
            }


            buffer.append(outPath).append(name).append(" ").append(path);

            process = Runtime.getRuntime().exec(buffer.toString());

            if (process != null) {
                resultMap.put("code",1000);
                resultMap.put("msg","执行成功");
            } else {
                resultMap.put("code",1001);
                resultMap.put("msg","执行失败");
            }
        } catch (Exception ex) {
            logWriter.debug(ex.getMessage());
            ex.printStackTrace();
            resultMap.put("code", 1002);
            resultMap.put("code", "发生未知错误，稍后再试");
        } finally {
            return JsonUtil.getJsonFromObject(resultMap);
        }

    }

    /**
     * 递归查询javac.exe
     * @param file
     * @param list
     * @return
     */
    private List<String> getJavacAbsolutePath (File file, List<String> list) {
        if (file.exists()) {
            if (file.isDirectory()) {
                File[] files = file.listFiles();
                for (File f : files) {
                    getJavacAbsolutePath(f, list);
                }
            } else {
                if ("javac.exe".equals(file.getName())) {
                    list.add(file.getAbsolutePath());
                }
            }
        }
        return list;
    }

    /**
     * 查询项目所需类库
     * @param path
     * @return
     */
    private String getClassPathFileAbsolutePath(String path) {
        File file = new File(path);
        if (!file.isDirectory()) {
            return null;
        }
        StringBuffer buffer = new StringBuffer();
        List<String> fileList = new ArrayList<>();
        fileList = getClassPathSubFileAbsolutePath(file, fileList);
        int size = fileList.size();
        if (size > 0) {
            for (int i = 0; i < size; i++) {
                buffer.append(fileList.get(i)).append(";");
            }
        } else {
            return null;
        }
        return buffer.toString();
    }

    /**
     * 查询项目源文件绝对路径
     * @param root
     * @return
     */
    private String getSourceFileAbsolutePath(String root) {
        File file = new File(root);
        StringBuffer buffer = new StringBuffer();
        List<String> fileList = new ArrayList<>();
        fileList = getAllJavaFileAbsolutePath(file, fileList);
        int size = fileList.size();
        if (size > 0) {
            for (int i = 0; i < size; i++) {
                buffer.append(fileList.get(i));
                if (i < size - 1) {
                    buffer.append(" ");
                }
            }
        }
        return buffer.toString();
    }

    private List<String> getAllJavaFileAbsolutePath (File file, List<String> list) {
        if (file.exists()) {
            if (file.isDirectory()) {
                File [] files = file.listFiles();
                for (File f : files) {
                    getAllJavaFileAbsolutePath(f, list);
                }
            } else {
                if (isJavaFile(file)) {
                    list.add(file.getAbsolutePath());
                }
            }
        }
        return list;
    }

    private List<String> getClassPathSubFileAbsolutePath (File file, List<String> list) {
        if (list == null) {
            list = new ArrayList<>();
        }
        if (file.exists()) {
            if (file.isDirectory()) {
                File [] files = file.listFiles();
                for (File f : files) {
                    getClassPathSubFileAbsolutePath(f, list);
                }
            } else {
                String name = file.getName();
                name = name.substring(name.lastIndexOf(".") + 1);
                if ("jar".equals(name)) {
                    list.add(file.getAbsolutePath());
                }
            }
        }
        return list;
    }

    private List<String> getAllJavaFileAbsolutePath (File file) {
        List<String> fileList = new ArrayList<>();
        return getAllJavaFileAbsolutePath(file, fileList);
    }

    /**
     * 判断是否是java源文件
     * @param file
     * @return
     */
    private boolean isJavaFile(File file) {
        String name = file.getName();
        name = name.substring(name.lastIndexOf(".")+1);
        if ("java".equals(name)) {
            return true;
        }
        return false;
    }

    private List<String> getDiffenrceNameFile(List<String> list1, List<String> list2) {
        List<String> list = new ArrayList<>();
        if (list1 == null || list2 == null) {
            return list;
        }
        for (String s : list2) {
            if (!list1.contains(s)) {
                list.add(s);
            }
        }
        return list;
    }

    private List<String> removeSameName(List<String> list1, List<String> list2) {
        for (int i = 0; i < list1.size(); i++) {
            if (list2.contains(list1.get(i))){
                list1.remove(i);
            }
        }
        return list1;
    }

    private List<String> getSameNameFile(List<String> list1, List<String> list2) {
        List<String> list = new ArrayList<>();
        if (list1 == null || list2 == null) {
            return list;
        }
        for (String s : list2) {
            if (list1.contains(s)) {
                list.add(s);
            }
        }
        return list;
    }

    private List<String> getFileNameList(File [] files) {
        List<String> list = new ArrayList<>();
        for (File file : files) {
            if (!list.contains(file.getName())) {
                list.add(file.getName());
            }
        }
        return list;
    }

    private void copyFile(String sourcePath, String newPath) {
        File source = new File(sourcePath);
        File dest = new File(newPath);
        FileChannel sourceFileChannel = null;
        FileChannel destFileChannel = null;
        try {
            sourceFileChannel = new FileInputStream(source).getChannel();
            destFileChannel = new FileOutputStream(dest).getChannel();
            destFileChannel.transferFrom(sourceFileChannel, 0, sourceFileChannel.size());
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            if (null != sourceFileChannel) {
                try {
                    sourceFileChannel.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (null != destFileChannel) {
                try {
                    destFileChannel.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private void copyDir (String source, String dest) {
        File file = new File(source);
        String[] filePath = file.list();

        if (!(new File(dest)).exists()) {
            (new File(dest)).mkdir();
        }

        for (int i = 0; i < filePath.length; i++) {
            if ((new File(source + file.separator + filePath[i])).isDirectory()) {
                copyDir(source  + file.separator  + filePath[i], dest  + file.separator + filePath[i]);
            }

            if (new File(source  + file.separator + filePath[i]).isFile()) {
                copyFile(source + file.separator + filePath[i], dest + file.separator + filePath[i]);
            }
        }
    }
}
