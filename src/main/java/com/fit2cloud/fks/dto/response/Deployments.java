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
public class Deployments {

    private String name;
    private int ready_replicas;
    private int replicas;
    private String namespace;
    public void setName(String name) {
         this.name = name;
     }
     public String getName() {
         return name;
     }

    public void setReady_replicas(int ready_replicas) {
         this.ready_replicas = ready_replicas;
     }
     public int getReady_replicas() {
         return ready_replicas;
     }

    public void setReplicas(int replicas) {
         this.replicas = replicas;
     }
     public int getReplicas() {
         return replicas;
     }

    public void setNamespace(String namespace) {
         this.namespace = namespace;
     }
     public String getNamespace() {
         return namespace;
     }

}