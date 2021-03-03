package com.fit2cloud.fks.dto;

import io.swagger.annotations.ApiModelProperty;

public class ClusterDTO {

    @ApiModelProperty("集群ID")
    private String cloudAccountId;

    @ApiModelProperty("集群名称")
    private String cloudAccountName;

    @ApiModelProperty("插件")
    private String plugin;

    @ApiModelProperty("图标")
    private String icon;

    @ApiModelProperty("节点数量")
    private int node;

    @ApiModelProperty("项目数量")
    private int project;

    @ApiModelProperty("持久卷数量")
    private int pv;

    @ApiModelProperty("用户数量")
    private int user;

    public int getUser() {
        return user;
    }

    public void setUser(int user) {
        this.user = user;
    }

    public String getCloudAccountId() {
        return cloudAccountId;
    }

    public void setCloudAccountId(String cloudAccountId) {
        this.cloudAccountId = cloudAccountId;
    }

    public String getCloudAccountName() {
        return cloudAccountName;
    }

    public void setCloudAccountName(String cloudAccountName) {
        this.cloudAccountName = cloudAccountName;
    }

    public String getPlugin() {
        return plugin;
    }

    public void setPlugin(String plugin) {
        this.plugin = plugin;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public int getNode() {
        return node;
    }

    public void setNode(int node) {
        this.node = node;
    }

    public int getProject() {
        return project;
    }

    public void setProject(int project) {
        this.project = project;
    }

    public int getPv() {
        return pv;
    }

    public void setPv(int pv) {
        this.pv = pv;
    }
}
