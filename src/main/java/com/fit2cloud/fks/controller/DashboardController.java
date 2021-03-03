package com.fit2cloud.fks.controller;


import com.fit2cloud.commons.server.model.ChartData;
import com.fit2cloud.fks.common.constants.PermissionConstants;
import com.fit2cloud.fks.dto.ComponentStatusDTO;
import com.fit2cloud.fks.dto.DashboardClusterDTO;
import com.fit2cloud.fks.service.DashboardService;
import io.swagger.annotations.Api;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * Author: chunxing
 * Date: 2018/8/3  上午11:41
 * Description: dashboard 调用 API
 */
@Api(tags = "api4dashboard")
@RequestMapping("/dashboard")
@RestController
public class DashboardController {

    @Resource
    private DashboardService dashboardService;

    @GetMapping("dashboard/kcLdapInfo")
    public Object getCloud() {
        return dashboardService.getKcLdapInfo();
    }

    @PostMapping("/cluster")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public List<DashboardClusterDTO> getClusters(@RequestBody Map<String, Object> param) {
        return dashboardService.getCluster(param);
    }

    @PostMapping("cluster/state")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public List<ChartData> getClusterStatus(@RequestBody Map<String, Object> param) {
        return dashboardService.getClusterStatus(param);
    }

    @PostMapping("master/state")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public List<ChartData> getMasterStatus(@RequestBody Map<String, Object> param) {
        return dashboardService.getMasterStatus(param);
    }

    @PostMapping("worker/state")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public List<ChartData> getWorkerStatus(@RequestBody Map<String, Object> param) {
        return dashboardService.getWorkerStatus(param);
    }

    @PostMapping("container/etcd")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public ComponentStatusDTO getEtcdServices(@RequestBody Map<String, Object> param) {
        return dashboardService.getMasterServices(param);
    }

    @PostMapping("container/api")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public ComponentStatusDTO getApiServices(@RequestBody Map<String, Object> param) {
        return dashboardService.getPodStatus(param);
    }

    @PostMapping("container/scheduler")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public ComponentStatusDTO getSchedulerServices(@RequestBody Map<String, Object> param) {
        return dashboardService.getMasterServices(param);
    }

    @PostMapping("container/controllerManager")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public ComponentStatusDTO getControllerManagerServices(@RequestBody Map<String, Object> param) {
        return dashboardService.getMasterServices(param);
    }

    @PostMapping("container/docker")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public ComponentStatusDTO getDockerServices(@RequestBody Map<String, Object> param) {
        return dashboardService.getMasterServices(param);
    }

    @PostMapping("container/kubelet")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public ComponentStatusDTO getKubeletServices(@RequestBody Map<String, Object> param) {
        return dashboardService.getMasterServices(param);
    }

    @PostMapping("container/proxy")
    @RequiresPermissions(PermissionConstants.DASHBOARD_READ)
    public ComponentStatusDTO getProxyServices(@RequestBody Map<String, Object> param) {
        return dashboardService.getPodStatus(param);
    }
}
