package com.fit2cloud.fks.controller;


import com.fit2cloud.commons.server.base.domain.Workspace;
import com.fit2cloud.commons.server.model.SessionUser;
import com.fit2cloud.commons.server.utils.SessionUtils;
import com.fit2cloud.fks.dto.ClusterDTO;
import com.fit2cloud.fks.dto.DashboardClusterDTO;
import com.fit2cloud.fks.dto.KoClusterDTO;
import com.fit2cloud.fks.service.ClusterService;
import com.fit2cloud.fks.service.DashboardService;
import io.swagger.annotations.Api;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Author: shifei
 * Date: 2020/3/11  上午11:31
 * Description: cluster 调用 API
 */
@Api(tags = "api4cluster")
@RequestMapping("/cluster")
@RestController
public class ClusterController {
    @Resource
    private DashboardService dashboardService;
    @Resource
    private ClusterService clusterService;

    /**
     * 获取 有权限的集群
     * <p>
     * 组织管理和工作空间用户 查看有授权的工作空间的project对应的集群
     *
     * @return
     */
    @GetMapping("/condition/list")
    public List<ClusterDTO> getClusters() {
        Map<String, Object> param = new HashMap<>();
        dashboardService.convertParam(param);
        return clusterService.topoClusters(param);
    }

    @GetMapping("/organizations")
    public Object organizations() {
        SessionUser sessionUser = SessionUtils.getUser();
        return clusterService.organizations(sessionUser);
    }

    @RequestMapping(value = "/org/{orgId}", method = RequestMethod.GET)
    public List<Workspace> workspacesByOrgId(@PathVariable String orgId) {
        return clusterService.getWorkspacesByOrgId(orgId);
    }

    @PostMapping("/save/auth")
    public int saveAuth(@RequestBody Map<String, Object> param) {
        return clusterService.saveAuth(param);
    }

    @PostMapping("/query/auth")
    public DashboardClusterDTO queryAuth(@RequestBody String clusterId) {
        DashboardClusterDTO dashboardClusterDTO = clusterService.queryAuth(clusterId);
        return dashboardClusterDTO;
    }

    @PostMapping("/save/koClusters")
    public int saveKoClusters(@RequestBody List<Map<String, Object>> params) {
        return clusterService.saveKoClusters(params);
    }

    @PostMapping("/query/koClusters")
    public List<KoClusterDTO> queryKoClusters() {
        return clusterService.queryKoClusters();
    }
}
