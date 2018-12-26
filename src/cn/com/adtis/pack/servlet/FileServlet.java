package cn.com.adtis.pack.servlet;

import cn.com.adtis.pack.service.LmsService;
import cn.com.adtis.pack.service.impl.FileServiceImpl;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class FileServlet extends HttpServlet {

    private Logger logWriter = Logger.getLogger(FileServlet.class.getName());

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        LmsService lmsservice = null;
        try {
            logWriter.debug("[FileServlet][doPost] in");
            request.setCharacterEncoding("UTF-8");
            response.setContentType("text/html; charset=UTF-8");
            response.setHeader("Expires", "-1");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Cache-Control", "no-cache");
            lmsservice = new FileServiceImpl();
            lmsservice.setContext(this.getServletContext());
            lmsservice.doService(request, response);
        } catch (Exception ex) {
            logWriter.error("[FileServlet][doPost]", ex);
        } finally {
            logWriter.debug("[FileServlet][doPost] out");
        }
    }
}
