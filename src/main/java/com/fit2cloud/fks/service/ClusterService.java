package com.fit2cloud.fks.service;

import com.fit2cloud.commons.server.base.domain.OrganizationExample;
import com.fit2cloud.commons.server.base.domain.Workspace;
import com.fit2cloud.commons.server.base.domain.WorkspaceExample;
import com.fit2cloud.commons.server.base.mapper.OrganizationMapper;
import com.fit2cloud.commons.server.base.mapper.WorkspaceMapper;
import com.fit2cloud.commons.server.constants.RoleConstants;
import com.fit2cloud.commons.server.model.SessionUser;
import com.fit2cloud.commons.server.utils.SessionUtils;
import com.fit2cloud.commons.server.utils.UserRoleUtils;
import com.fit2cloud.commons.utils.LogUtil;
import com.fit2cloud.fks.dao.ExtClusterMapper;
import com.fit2cloud.fks.dao.KoClusterMapper;
import com.fit2cloud.fks.dto.ClusterDTO;
import com.fit2cloud.fks.dto.DashboardClusterDTO;
import com.fit2cloud.fks.dto.KoClusterDTO;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.util.CollectionUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @program fit2cloud2.0-fks-service
 * @description:
 * @author: shifei
 * @create: 2020/3/11 11:34
 */
@Service
public class ClusterService {
    @Resource
    private ExtClusterMapper extClusterMapper;
    @Resource
    OrganizationMapper organizationMapper;
    @Resource
    private WorkspaceMapper workspaceMapper;
    @Resource
    private KoClusterMapper koClusterMapper;

    private static final String ORG_ADMIN = "ORGADMIN";

    private static final String USER = "USER";

    /**
     * 包含普通用户和组织管理员
     * 通过 workspaceId 找project对应的cluster
     * <p>
     * 注意 只有云集群信息 没有各种计数
     *
     * @param param
     * @return
     */
    public List<ClusterDTO> topoClusters(Map<String, Object> param) {
        return extClusterMapper.topoClusters(param);
    }

    public Object organizations(SessionUser sessionUser) {
        OrganizationExample example = new OrganizationExample();
        if (StringUtils.equals(sessionUser.getParentRoleId(), RoleConstants.Id.ORGADMIN.name())) {
            Set<String> resourceIds = UserRoleUtils.getResourceIds(sessionUser.getId());
            example.createCriteria().andIdIn(new ArrayList<>(resourceIds));
        }
        example.setOrderByClause("name");
        return organizationMapper.selectByExample(example);
    }

    public List<Workspace> getWorkspacesByOrgId(String orgId) {
        WorkspaceExample workspaceExample = new WorkspaceExample();
        workspaceExample.createCriteria().andOrganizationIdEqualTo(orgId);
        return workspaceMapper.selectByExample(workspaceExample);
    }

    public int saveAuth(Map<String, Object> param) {
        DashboardClusterDTO dashboardClusterDTO = new DashboardClusterDTO();
        dashboardClusterDTO.setCloudAccountId((String) param.get("cloudAccountId"));
        dashboardClusterDTO.setCloudAccountName((String)param.get("cloudAccountName"));
        dashboardClusterDTO.setOrganizationId((String)param.get("organizationId"));
        dashboardClusterDTO.setOrganizationName((String)param.get("organizationName"));
        dashboardClusterDTO.setWorkspaceId((String)param.get("workspaceId"));
        dashboardClusterDTO.setWorkspaceName((String)param.get("workspaceName"));
        extClusterMapper.deleteAuthClusters((String) param.get("cloudAccountId"));
        return extClusterMapper.saveAuthClusters(dashboardClusterDTO);
    }

    public DashboardClusterDTO queryAuth(String clusterId) {
        return extClusterMapper.queryAuthClusters(clusterId);
    }

    public int saveKoClusters(List<Map<String, Object>> params) {
        LogUtil.getLogger().info("saveKoClusters start, params are:", params);
        if (CollectionUtils.isEmpty(params)) {
            LogUtil.getLogger().error("saveKoClusters failed, params are empty.");
            return 0;
        }

        int successNum = 0;
        List<KoClusterDTO> koClusterDTOs = koClusterMapper.queryKoClusters();
        List<String> existIds = new ArrayList<>();
        for (KoClusterDTO kc : koClusterDTOs) {
            existIds.add(kc.getCloudAccountId());
        }

        for (Map<String, Object> param : params) {
            if (existIds.contains(param.get("cloudAccountId"))) {
                continue;
            }

            KoClusterDTO koClusterDTO = new KoClusterDTO();
            koClusterDTO.setCloudAccountId((String)param.get("cloudAccountId"));
            koClusterDTO.setCloudAccountName((String)param.get("cloudAccountName"));
            koClusterDTO.setVersion((String)param.get("version"));
            koClusterDTO.setDeployType((String)param.get("deployType"));
            koClusterDTO.setNode((String) param.get("node"));
            koClusterDTO.setStatus((String)param.get("status"));
            koClusterDTO.setResourceType((String)param.get("resourceType"));

            LogUtil.getLogger().info("koClusterDTO is:", koClusterDTO);
            koClusterMapper.saveKoClusters(koClusterDTO);
            successNum++;
        }

        return successNum;
    }

    public List<KoClusterDTO> queryKoClusters() {
        List<KoClusterDTO> koClusterDTOs = koClusterMapper.queryKoClusters();
        if (CollectionUtils.isEmpty(koClusterDTOs)) {
            return koClusterDTOs;
        }

        List<KoClusterDTO> clusters = new ArrayList<>();
        SessionUser su = SessionUtils.getUser();
        String parentRoleId = su.getParentRoleId();
        String id;
        if (USER.equals(parentRoleId)) {
            id = su.getWorkspaceId();
        } else if (ORG_ADMIN.equals(parentRoleId)) {
            id = su.getOrganizationId();
        } else {
            return koClusterDTOs;
        }

        for (KoClusterDTO koClusterDTO : koClusterDTOs) {
            String clusterId = koClusterDTO.getCloudAccountId();
            DashboardClusterDTO clusterAuth = extClusterMapper.queryAuthClusters(clusterId);
            if (clusterAuth != null
                    && (clusterAuth.getOrganizationId().equals(id)
                    || clusterAuth.getWorkspaceId().equals(id))) {
                clusters.add(koClusterDTO);
            }
        }
        return clusters;
    }
}
