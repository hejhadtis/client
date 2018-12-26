package cn.com.adtis.pack.util;

public class StringUtil {

    public static boolean isEmpty(String value) {
        if(value == null){
            return true;
        }
        if ("".equals(value.trim())){
            return true;
        }
        return false;
    }

    public static int paresInt(String value, int defalutValue) {
        if (value == null) {
            return defalutValue;
        }
        if ("".equals(value.trim())) {
            return defalutValue;
        }
        return Integer.parseInt(value);
    }
}
