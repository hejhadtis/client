package cn.com.adtis.pack.util;

import java.io.*;
import java.lang.ref.WeakReference;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FileTest {

    public static void main (String [] args) {
//        String newPath = "D:/file/222";
//        String oldPath = "D:/file/111";
//        File file = new File(newPath);
//        File file2 = new File(oldPath);
//
//        List<Map<String, Object>> list1 = getAllFileNameAndDate(file);
//        List<Map<String, Object>> list2 = getAllFileNameAndDate(file2);
//        contrast(list1, list2);

        String path = "D:/hejunhua/desktop/SQL笔记.doc";
        writeFile(path);
    }

    private static List<Map<String, Object>> contrast (List<Map<String, Object>> newList, List<Map<String, Object>> oldList) {
        List<Map<String, Object>> leftList = new ArrayList<>();
        List<Map<String, Object>> rightList = new ArrayList<>();
        for (int i = 0; i < newList.size(); i++) {
            for (int j = 0; j < oldList.size(); j++) {
                int newLevel = (int) newList.get(i).get("level");
                int oldLevel = (int) oldList.get(j).get("level");
                if (newLevel == oldLevel) {
                    String newName = (String) newList.get(i).get("name");
                    String oldName = (String) oldList.get(j).get("name");
                    String newParentName = (String) newList.get(i).get("parentName");
                    String oldParentName = (String) oldList.get(j).get("parentName");
                    long newDate = (long) newList.get(i).get("date");
                    long oldDate = (long) oldList.get(j).get("date");
                    if (newParentName.equals(oldParentName)) {
                        if (newName.equals(oldName)) {
                            if (newDate != oldDate) {
                                Map<String, Object> leftMap = new HashMap<>();
                                leftMap.put("name", newName);
                                leftMap.put("class", "blue");
                                leftList.add(leftMap);
                            }
                            newList.remove(i);
                            oldList.remove(j);
                        } else {

                        }
                    }
                }
            }
        }
        return leftList;
    }

    private static List<Map<String, Object>> getAllFileNameAndDate(File file) {
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        String parentPath = file.getParent();
        return getAllFileNameAndDate(file, list, parentPath, "");
    }

    private static List<Map<String, Object>> getAllFileNameAndDate (File file, List<Map<String, Object>> list, String parentPath, String parentName) {
        if (file.exists()) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", file.getName());
            map.put("date", file.lastModified());
            String absPath = file.getAbsolutePath();
            absPath = absPath.substring(parentPath.length()+1);
            String [] parents = absPath.split("\\\\");
            map.put("level", parents.length - 1);
            map.put("parentName", parentName);
            list.add(map);
            if (file.isDirectory()) {
                File[] files = file.listFiles();
                for (File f : files) {
                    getAllFileNameAndDate(f, list, parentPath, parentName + File.separator + f.getName());
                }
            }
        }
        return list;
    }

    private static void exec(String path) {
        try {
            Process process = Runtime.getRuntime().exec(path);
            System.out.println(process.getInputStream());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static List<String> getAllSubFileName (File file, List<String> list) {
        if (file.exists()) {
            if (file.isDirectory()) {
                File [] files = file.listFiles();
                for (File f : files) {
                    getAllSubFileName(f, list);
                }
            } else {
                //此处可以添加判断条件
                list.add(file.getName());
            }
        }
        return list;
    }

    private static List<String> getAllSubFileName(File file) {
        List<String> fileList = new ArrayList<>();
        return getAllSubFileName(file, fileList);
    }

    private boolean isJavaFile(File file) {
        String name = file.getName();
        name = name.substring(name.lastIndexOf(".")+1);
        if ("java".equals(name)) {
            return true;
        }
        return false;
    }

    private static void writeFile(String path) {
        FileInputStream fis = null;
        InputStreamReader isr = null;
        BufferedReader br = null;
        String line = null;
        try {
            fis = new FileInputStream(path);
            isr = new InputStreamReader(fis, "gbk");
            br = new BufferedReader(isr);
            while((line=br.readLine())!=null){//字符不等于空
                System.out.println(line);//一行一行地输出
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
