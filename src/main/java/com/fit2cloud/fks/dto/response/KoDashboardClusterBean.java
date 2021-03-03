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
public class KoDashboardClusterBean {

    private String id;
    private String name;
    private List<Pods> pods;
    private List<Nodes> nodes;
    private String token;
    private List<Namespaces> namespaces;
    private List<Deployments> deployments;
    private int cpu_usage;
    private int cpu_total;
    private int mem_usage;
    private int mem_total;
    private List<Restart_pods> restart_pods;
    private List<Warn_containers> warn_containers;
    private List<String> error_loki_containers;
    private List<Error_pods> error_pods;
    public void setId(String id) {
         this.id = id;
     }
     public String getId() {
         return id;
     }

    public void setName(String name) {
         this.name = name;
     }
     public String getName() {
         return name;
     }

    public void setPods(List<Pods> pods) {
         this.pods = pods;
     }
     public List<Pods> getPods() {
         return pods;
     }

    public void setNodes(List<Nodes> nodes) {
         this.nodes = nodes;
     }
     public List<Nodes> getNodes() {
         return nodes;
     }

    public void setToken(String token) {
         this.token = token;
     }
     public String getToken() {
         return token;
     }

    public void setNamespaces(List<Namespaces> namespaces) {
         this.namespaces = namespaces;
     }
     public List<Namespaces> getNamespaces() {
         return namespaces;
     }

    public void setDeployments(List<Deployments> deployments) {
         this.deployments = deployments;
     }
     public List<Deployments> getDeployments() {
         return deployments;
     }

    public void setCpu_usage(int cpu_usage) {
         this.cpu_usage = cpu_usage;
     }
     public int getCpu_usage() {
         return cpu_usage;
     }

    public void setCpu_total(int cpu_total) {
         this.cpu_total = cpu_total;
     }
     public int getCpu_total() {
         return cpu_total;
     }

    public void setMem_usage(int mem_usage) {
         this.mem_usage = mem_usage;
     }
     public int getMem_usage() {
         return mem_usage;
     }

    public void setMem_total(int mem_total) {
         this.mem_total = mem_total;
     }
     public int getMem_total() {
         return mem_total;
     }

    public void setRestart_pods(List<Restart_pods> restart_pods) {
         this.restart_pods = restart_pods;
     }
     public List<Restart_pods> getRestart_pods() {
         return restart_pods;
     }

    public void setWarn_containers(List<Warn_containers> warn_containers) {
         this.warn_containers = warn_containers;
     }
     public List<Warn_containers> getWarn_containers() {
         return warn_containers;
     }

    public void setError_loki_containers(List<String> error_loki_containers) {
         this.error_loki_containers = error_loki_containers;
     }
     public List<String> getError_loki_containers() {
         return error_loki_containers;
     }

    public void setError_pods(List<Error_pods> error_pods) {
         this.error_pods = error_pods;
     }
     public List<Error_pods> getError_pods() {
         return error_pods;
     }

}