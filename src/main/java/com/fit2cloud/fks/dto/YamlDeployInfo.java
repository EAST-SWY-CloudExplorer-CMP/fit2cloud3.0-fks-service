package com.fit2cloud.fks.dto;

public class YamlDeployInfo extends YamlDeployClusterInfo {
    private Integer yamlRepoId;
    private String yamlRepoName;

    public Integer getYamlRepoId() {
        return yamlRepoId;
    }

    public void setYamlRepoId(Integer yamlRepoId) {
        this.yamlRepoId = yamlRepoId;
    }

    public String getYamlRepoName() {
        return yamlRepoName;
    }

    public void setYamlRepoName(String yamlRepoName) {
        this.yamlRepoName = yamlRepoName;
    }
}
