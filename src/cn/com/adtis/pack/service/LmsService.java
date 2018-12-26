package cn.com.adtis.pack.service;

import javax.servlet.ServletContext;

public abstract class LmsService implements Service{

    private ServletContext context = null;

    public ServletContext getContext() {
        return context;
    }

    public void setContext(ServletContext context) {
        this.context = context;
    }

    protected void endService() {
    }
}
