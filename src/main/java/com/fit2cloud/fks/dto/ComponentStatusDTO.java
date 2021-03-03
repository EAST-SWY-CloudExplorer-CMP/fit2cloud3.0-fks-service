package com.fit2cloud.fks.dto;

import io.swagger.annotations.ApiModelProperty;

public class ComponentStatusDTO {
    @ApiModelProperty("正常状态数")
    private Integer normalNum;

    @ApiModelProperty("异常状态数")
    private Integer abnormalNum;

    public Integer getNormalNum() {
        return normalNum;
    }

    public void setNormalNumr(Integer normalNum) {
        this.normalNum = normalNum;
    }

    public Integer getAbnormalNum() {
        return abnormalNum;
    }

    public void setAbnormalNum(Integer abnormalNum) {
        this.abnormalNum = abnormalNum;
    }
}

