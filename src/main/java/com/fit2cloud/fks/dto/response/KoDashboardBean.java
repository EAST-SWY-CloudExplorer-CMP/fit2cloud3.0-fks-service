/**
  * Copyright 2020 bejson.com 
  */
package com.fit2cloud.fks.dto.response;
import java.util.List;

/**
 * Auto-generated: 2020-01-16 22:56:22
 *
 * @author bejson.com (i@bejson.com)
 * @website http://www.bejson.com/java2pojo/
 */
public class KoDashboardBean {

    //private List<String> data;
    private List<WarnContainers> warnContainers;
    private List<RestartPods> restartPods;
    private List<String> errorLokiContainers;
    private List<ErrorPods> errorPods;


    public void setWarnContainers(List<WarnContainers> warnContainers) {
         this.warnContainers = warnContainers;
     }
     public List<WarnContainers> getWarnContainers() {
         return warnContainers;
     }

    public void setRestartPods(List<RestartPods> restartPods) {
         this.restartPods = restartPods;
     }
     public List<RestartPods> getRestartPods() {
         return restartPods;
     }

    public void setErrorLokiContainers(List<String> errorLokiContainers) {
         this.errorLokiContainers = errorLokiContainers;
     }
     public List<String> getErrorLokiContainers() {
         return errorLokiContainers;
     }

    public void setErrorPods(List<ErrorPods> errorPods) {
         this.errorPods = errorPods;
     }
     public List<ErrorPods> getErrorPods() {
         return errorPods;
     }

}