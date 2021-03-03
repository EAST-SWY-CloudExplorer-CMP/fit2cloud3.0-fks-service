/**
  * Copyright 2020 bejson.com 
  */
package com.fit2cloud.fks.dto.response;
import java.util.List;

/**
 * Auto-generated: 2020-01-16 22:59:32
 *
 * @author bejson.com (i@bejson.com)
 * @website http://www.bejson.com/java2pojo/
 */
public class Error_pods {

    private String name;
    private String cluster_name;
    private int restart_count;
    private String status;
    private String namespace;
    private String host_ip;
    private String pod_ip;
    private String host_name;
    private List<Containers> containers;
    public void setName(String name) {
         this.name = name;
     }
     public String getName() {
         return name;
     }

    public void setCluster_name(String cluster_name) {
         this.cluster_name = cluster_name;
     }
     public String getCluster_name() {
         return cluster_name;
     }

    public void setRestart_count(int restart_count) {
         this.restart_count = restart_count;
     }
     public int getRestart_count() {
         return restart_count;
     }

    public void setStatus(String status) {
         this.status = status;
     }
     public String getStatus() {
         return status;
     }

    public void setNamespace(String namespace) {
         this.namespace = namespace;
     }
     public String getNamespace() {
         return namespace;
     }

    public void setHost_ip(String host_ip) {
         this.host_ip = host_ip;
     }
     public String getHost_ip() {
         return host_ip;
     }

    public void setPod_ip(String pod_ip) {
         this.pod_ip = pod_ip;
     }
     public String getPod_ip() {
         return pod_ip;
     }

    public void setHost_name(String host_name) {
         this.host_name = host_name;
     }
     public String getHost_name() {
         return host_name;
     }

    public void setContainers(List<Containers> containers) {
         this.containers = containers;
     }
     public List<Containers> getContainers() {
         return containers;
     }

}