package com.fit2cloud.fks.dto;

import io.swagger.annotations.ApiModelProperty;

import java.util.Date;

public class SpecsDTO {

    @ApiModelProperty("规格编号")
    private String specsId;

    @ApiModelProperty("规格名称")
    private String specsName;

    @ApiModelProperty("节点数量")
    private String nodeNum;

    @ApiModelProperty("可用区")
    private String zone;

    @ApiModelProperty("部署模型")
    private String deployType;

    @ApiModelProperty("创建时间")
    private Date createTime;

    public String getSpecsId() {
        return specsId;
    }

    public void setSpecsId(String specsId) {
        this.specsId = specsId;
    }

    public String getSpecsName() {
        return specsName;
    }

    public void setSpecsName(String specsName) {
        this.specsName = specsName;
    }

    public String getNodeNum() {
        return nodeNum;
    }

    public void setNodeNum(String nodeNum) {
        this.nodeNum = nodeNum;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public String getDeployType() {
        return deployType;
    }

    public void setDeployType(String deployType) {
        this.deployType = deployType;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }
}
