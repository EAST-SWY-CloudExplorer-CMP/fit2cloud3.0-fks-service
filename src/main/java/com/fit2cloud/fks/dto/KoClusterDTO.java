package com.fit2cloud.fks.dto;

import io.swagger.annotations.ApiModelProperty;

public class KoClusterDTO {

    @ApiModelProperty("集群ID")
    private String cloudAccountId;

    @ApiModelProperty("集群名称")
    private String cloudAccountName;

    @ApiModelProperty("集群版本")
    private String version;

    @ApiModelProperty("部署模型")
    private String deployType;

    @ApiModelProperty("节点数量")
    private String node;

    @ApiModelProperty("集群状态")
    private String status;

    @ApiModelProperty("集群来源")
    private String resourceType;

    @ApiModelProperty("组织")
    private String organizationId;

    @ApiModelProperty("组织名称")
    private String organizationName;

    @ApiModelProperty("工作空间")
    private String workspaceId;

    @ApiModelProperty("工作空间名称")
    private String workspaceName;

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

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getDeployType() {
        return deployType;
    }

    public void setDeployType(String deployType) {
        this.deployType = deployType;
    }

    public String getNode() {
        return node;
    }

    public void setNode(String node) {
        this.node = node;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }
}
