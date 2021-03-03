/**
  * Copyright 2020 bejson.com 
  */
package com.fit2cloud.fks.dto.response;
import java.util.List;

/**
 * Auto-generated: 2020-01-16 18:21:57
 *
 * @author bejson.com (i@bejson.com)
 * @website http://www.bejson.com/java2pojo/
 */
public class KoClusterNodesBean {
    private String id;
    private String name;
    private String ip;
    private int port;
    private Vars vars;
    private List<String> roles;
    private String host;
    private String status;
    private int host_memory;
    private int host_cpu_core;
    private String host_os;
    private String host_os_version;
    private String os;

    public String getOs() {
        return host_os+"\n"+host_os_version;
    }

    public int getHost_memory() {
        return host_memory;
    }

    public void setHost_memory(int host_memory) {
        this.host_memory = host_memory;
    }

    public int getHost_cpu_core() {
        return host_cpu_core;
    }

    public void setHost_cpu_core(int host_cpu_core) {
        this.host_cpu_core = host_cpu_core;
    }

    public String getHost_os() {
        return host_os;
    }

    public void setHost_os(String host_os) {
        this.host_os = host_os;
    }

    public String getHost_os_version() {
        return host_os_version;
    }

    public void setHost_os_version(String host_os_version) {
        this.host_os_version = host_os_version;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public Vars getVars() {
        return vars;
    }

    public void setVars(Vars vars) {
        this.vars = vars;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}