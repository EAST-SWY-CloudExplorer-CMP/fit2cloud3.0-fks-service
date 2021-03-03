package com.fit2cloud.fks.dto.response;

/**
 * Copyright 2020 bejson.com
 */
import java.util.List;

/**
 * Auto-generated: 2020-01-16 21:40:35
 *
 * @author bejson.com (i@bejson.com)
 * @website http://www.bejson.com/java2pojo/
 */
public class Zones {

    private String key;
    private String name;
    private String zone_name;
    private List<String> ip_pool;
    private String vc_storage;
    private String vc_network;
    private String ip_start;
    private String ip_end;
    private String vc_gateway;
    private String net_mask;
    private String vc_cluster;
    public void setKey(String key) {
        this.key = key;
    }
    public String getKey() {
        return key;
    }

    public void setName(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }

    public void setZone_name(String zone_name) {
        this.zone_name = zone_name;
    }
    public String getZone_name() {
        return zone_name;
    }

    public void setIp_pool(List<String> ip_pool) {
        this.ip_pool = ip_pool;
    }
    public List<String> getIp_pool() {
        return ip_pool;
    }

    public void setVc_storage(String vc_storage) {
        this.vc_storage = vc_storage;
    }
    public String getVc_storage() {
        return vc_storage;
    }

    public void setVc_network(String vc_network) {
        this.vc_network = vc_network;
    }
    public String getVc_network() {
        return vc_network;
    }

    public void setIp_start(String ip_start) {
        this.ip_start = ip_start;
    }
    public String getIp_start() {
        return ip_start;
    }

    public void setIp_end(String ip_end) {
        this.ip_end = ip_end;
    }
    public String getIp_end() {
        return ip_end;
    }

    public void setVc_gateway(String vc_gateway) {
        this.vc_gateway = vc_gateway;
    }
    public String getVc_gateway() {
        return vc_gateway;
    }

    public void setNet_mask(String net_mask) {
        this.net_mask = net_mask;
    }
    public String getNet_mask() {
        return net_mask;
    }

    public void setVc_cluster(String vc_cluster) {
        this.vc_cluster = vc_cluster;
    }
    public String getVc_cluster() {
        return vc_cluster;
    }

}
