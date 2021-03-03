/**
 * Copyright 2020 bejson.com
 */
package com.fit2cloud.fks.dto.response;
import java.util.List;

/**
 * Auto-generated: 2020-01-16 15:52:59
 *
 * @author bejson.com (i@bejson.com)
 * @website http://www.bejson.com/java2pojo/
 */
public class KoClustersBean {
    private String id;
    private String name;
    private int worker_size;
    private String persistent_storage;
    private String network_plugin;
    private String template;
    private String plan;
    private String comment;
    private String date_created;
    private String resource;
    private String resource_version;
    private String status;
    private List<String> nodes;
    private Apps apps;
    private String deploy_type;
    private String region;
    //private Meta meta;
    private List<String> zones;
    private String cloud_provider;
    private Configs configs;
    private String cluster_doamin_suffix;
    private int nodesNum;

    public int getNodesNum() {
        return nodes.size();
    }

    public Apps getApps() {
        return apps;
    }

    public void setApps(Apps apps) {
        this.apps = apps;
    }

    /*public Meta getMeta() {
        return meta;
    }

    public void setMeta(Meta meta) {
        this.meta = meta;
    }*/

    public List<String> getZones() {
        return zones;
    }

    public void setZones(List<String> zones) {
        this.zones = zones;
    }

    public Configs getConfigs() {
        return configs;
    }

    public void setConfigs(Configs configs) {
        this.configs = configs;
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

    public int getWorker_size() {
        return worker_size;
    }

    public void setWorker_size(int worker_size) {
        this.worker_size = worker_size;
    }

    public String getPersistent_storage() {
        return persistent_storage;
    }

    public void setPersistent_storage(String persistent_storage) {
        this.persistent_storage = persistent_storage;
    }

    public String getNetwork_plugin() {
        return network_plugin;
    }

    public void setNetwork_plugin(String network_plugin) {
        this.network_plugin = network_plugin;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getDate_created() {
        return date_created;
    }

    public void setDate_created(String date_created) {
        this.date_created = date_created;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getResource_version() {
        return resource_version;
    }

    public void setResource_version(String resource_version) {
        this.resource_version = resource_version;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getNodes() {
        return nodes;
    }

    public void setNodes(List<String> nodes) {
        this.nodes = nodes;
    }

    public String getDeploy_type() {
        return deploy_type;
    }

    public void setDeploy_type(String deploy_type) {
        this.deploy_type = deploy_type;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getCloud_provider() {
        return cloud_provider;
    }

    public void setCloud_provider(String cloud_provider) {
        this.cloud_provider = cloud_provider;
    }

    public String getCluster_doamin_suffix() {
        return cluster_doamin_suffix;
    }

    public void setCluster_doamin_suffix(String cluster_doamin_suffix) {
        this.cluster_doamin_suffix = cluster_doamin_suffix;
    }
}