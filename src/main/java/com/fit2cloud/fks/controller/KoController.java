package com.fit2cloud.fks.controller;

import com.fit2cloud.fks.dto.SpecsDTO;
import com.fit2cloud.fks.dto.YamlDeployClusterInfo;
import com.fit2cloud.fks.dto.response.KoClusterNodesBean;
import com.fit2cloud.fks.dto.response.KoClustersBean;
import com.fit2cloud.fks.dto.response.KoDashboardBean;
import com.fit2cloud.fks.model.KoSettings;
import com.fit2cloud.fks.service.KoService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

@Api(tags = "api4ko")
@RequestMapping("/ko")
@RestController
public class KoController {
    @Resource
    private KoService koService;

    @ApiOperation("概览")
    @GetMapping("/dashboard")
    public KoDashboardBean dashboard() throws Exception{
        return koService.getDashboard();
    }

    @ApiOperation("集群")
    @GetMapping("/clusters")
    public List<KoClustersBean> clusters() throws Exception{
        return koService.getClusters();
    }

    @ApiOperation("集群节点")
    @GetMapping("/clusters/{cluster_name}/nodes/")
    public List<KoClusterNodesBean> clusters(@PathVariable String cluster_name) throws Exception{
        return koService.getClusterNodes(cluster_name);
    }

    @ApiOperation("ko配置")
    @GetMapping("/settings")
    public KoSettings settings() throws Exception{
        return koService.getKoSettings();
    }

    @ApiOperation("ko配置")
    @PostMapping("/settings")
    public void updateSettings(@RequestBody KoSettings koSettings) throws Exception{
        koService.updateKoSettings(koSettings);
    }

    @ApiOperation("获取yaml可用的部署集群")
    @GetMapping("/listYamlClusters")
    public List<YamlDeployClusterInfo> listYamlClusters() throws Exception{
        return koService.listYamlClusters();
    }

    @ApiOperation("保存规格")
    @PostMapping("/saveSpecs")
    public int saveSpecs(@RequestBody Map<String, Object> param) throws Exception{
        return koService.saveSpecs(param);
    }

    @ApiOperation("查询规格列表")
    @PostMapping("/querySpecs")
    public List<SpecsDTO> querySpecs() throws Exception{
        return koService.querySpecs();
    }

    @ApiOperation("删除规格")
    @PostMapping("/deleteSpecs")
    public int deleteSpecs(@RequestBody Map<String, Object> param) throws Exception{
        return koService.deleteSpecs(param);
    }
}
