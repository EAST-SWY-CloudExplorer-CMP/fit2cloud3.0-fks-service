/**
  * Copyright 2020 bejson.com 
  */
package com.fit2cloud.fks.dto.response;

/**
 * Auto-generated: 2020-01-16 22:59:32
 *
 * @author bejson.com (i@bejson.com)
 * @website http://www.bejson.com/java2pojo/
 */
public class Warn_containers {

    private String name;
    private boolean ready;
    private int restart_count;
    private String pod_name;
    public void setName(String name) {
         this.name = name;
     }
     public String getName() {
         return name;
     }

    public void setReady(boolean ready) {
         this.ready = ready;
     }
     public boolean getReady() {
         return ready;
     }

    public void setRestart_count(int restart_count) {
         this.restart_count = restart_count;
     }
     public int getRestart_count() {
         return restart_count;
     }

    public void setPod_name(String pod_name) {
         this.pod_name = pod_name;
     }
     public String getPod_name() {
         return pod_name;
     }

}