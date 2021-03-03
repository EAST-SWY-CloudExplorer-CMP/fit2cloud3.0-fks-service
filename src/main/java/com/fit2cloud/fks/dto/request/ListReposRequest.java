package com.fit2cloud.fks.dto.request;

import com.fit2cloud.commons.annotation.FuzzyQuery;
import io.swagger.annotations.ApiModelProperty;

public class ListReposRequest {
    @ApiModelProperty("仓库ID")
    private String id;

    @ApiModelProperty("仓库名称,模糊匹配")
    @FuzzyQuery
    private String name;

    @ApiModelProperty("版本")
    @FuzzyQuery
    private String version;

    @ApiModelProperty(value = "排序Key", hidden = true)
    private String sort;

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

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }
}
