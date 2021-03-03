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
public class Nodes {

    private String name;
    private String status;
    private int cpu;
    private int mem;
    private int cpu_usage;
    private int mem_usage;
    public void setName(String name) {
         this.name = name;
     }
     public String getName() {
         return name;
     }

    public void setStatus(String status) {
         this.status = status;
     }
     public String getStatus() {
         return status;
     }

    public void setCpu(int cpu) {
         this.cpu = cpu;
     }
     public int getCpu() {
         return cpu;
     }

    public void setMem(int mem) {
         this.mem = mem;
     }
     public int getMem() {
         return mem;
     }

    public void setCpu_usage(int cpu_usage) {
         this.cpu_usage = cpu_usage;
     }
     public int getCpu_usage() {
         return cpu_usage;
     }

    public void setMem_usage(int mem_usage) {
         this.mem_usage = mem_usage;
     }
     public int getMem_usage() {
         return mem_usage;
     }

}