package cn.com.adtis.pack.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class JsonUtil {

    public static String getJsonFromObject(Object object){
        String result = null;
        try {
            Gson gson = new GsonBuilder().serializeNulls().create();
            result = gson.toJson(object);
        } catch (Exception e) {
            result = null;
        }
        return result;
    }
}
