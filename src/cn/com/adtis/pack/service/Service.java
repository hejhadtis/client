package cn.com.adtis.pack.service;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public interface Service {
    public void doService(HttpServletRequest request,
                          HttpServletResponse response) throws Exception;
}
