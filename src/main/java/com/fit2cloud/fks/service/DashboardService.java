package com.fit2cloud.fks.service;

import com.fit2cloud.commons.pluginmanager.CloudProviderManager;
import com.fit2cloud.commons.server.base.domain.CloudAccount;
import com.fit2cloud.commons.server.base.domain.CloudAccountExample;
import com.fit2cloud.commons.server.base.domain.Workspace;
import com.fit2cloud.commons.server.base.domain.WorkspaceExample;
import com.fit2cloud.commons.server.base.mapper.CloudAccountMapper;
import com.fit2cloud.commons.server.base.mapper.WorkspaceMapper;
import com.fit2cloud.commons.server.constants.RoleConstants;
import com.fit2cloud.commons.server.model.ChartData;
import com.fit2cloud.commons.server.model.DashBoardTextDTO;
import com.fit2cloud.commons.server.model.SessionUser;
import com.fit2cloud.commons.server.utils.SessionUtils;
import com.fit2cloud.commons.utils.LogUtil;
import com.fit2cloud.commons.utils.UUIDUtil;
import com.fit2cloud.fks.dao.CsProjectMapper;
import com.fit2cloud.fks.dao.ExtClusterMapper;
import com.fit2cloud.fks.dto.ComponentStatusDTO;
import com.fit2cloud.fks.dto.DashboardClusterDTO;
import com.fit2cloud.fks.model.CsProject;
import com.fit2cloud.fks.model.CsProjectExample;
import com.fit2cloud.plugin.container.k8s.KubernetesProvider;
import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.VersionInfo;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

/**
 * @program fit2cloud2.0-kc-ldap-service
 * @description:
 * @author: wanziliang
 * @create: 2019/12/18 15:34
 */
@Service
public class DashboardService {

    @Resource
    private CloudAccountMapper cloudAccountMapper;

    @Resource
    private CloudProviderManager cloudProviderManager;

    @Resource
    private WorkspaceMapper workspaceMapper;

    @Resource
    private ExtClusterMapper extClusterMapper;

    @Resource
    private CsProjectMapper csProjectMapper;

    private static final String HEALTHY = "Healthy";

    private static final String TRUE_STATUS = "True";

    private static final String ORG_ADMIN = "ORGADMIN";

    private static final String USER = "USER";

    private static final int ONE_MASTER = 1;

    private static final int MULTIPLE_MASTERS = 2;

    /* 该类型的值用于判断node节点是否健康 */
    private static final String READY = "Ready";

    /* true : 健康 false : 不健康 Unknown : node controller正在尝试连接node */
    private static final String TRUE = "True";

    public List<DashBoardTextDTO> getKcLdapInfo() {
        //todo
        return null;
    }

    /**
     * 获取集群
     * @return
     */
    public List<DashboardClusterDTO> getCluster(Map<String, Object> param) {
        convertParam(param);
        List<DashboardClusterDTO> dashboardClusters = extClusterMapper.getDashboardClusters(convert2Map(param));
        //dashboardClusters = dashboardClusters.stream().filter(dashboardClusterDTO -> dashboardClusterDTO.getProject() > 0).collect(Collectors.toList());
        dashboardClusters = matchWorkspaces(dashboardClusters);

        CloudAccountExample cloudAccountExample = new CloudAccountExample();
        List<CloudAccount> cloudAccounts = cloudAccountMapper.selectByExample(cloudAccountExample);
        if (CollectionUtils.isEmpty(cloudAccounts)) {
            LogUtil.getLogger().error("cloudAccounts are empty.");
            return null;
        }
        for (CloudAccount cloudAccount : cloudAccounts) {
            if (!"fit2cloud-kubernetes-plugin".equals(cloudAccount.getPluginName())) {
                LogUtil.getLogger().error("This plugin is not kubernetes.");
                continue;
            }
            for (DashboardClusterDTO dashboardClusterDTO : dashboardClusters) {
                int masterNum = 0;
                if (dashboardClusterDTO.getCloudAccountName().equals(cloudAccount.getName())) {
                    try {
                        dashboardClusterDTO.setStatus(cloudAccount.getStatus());

                        String credential = cloudAccount.getCredential();
                        KubernetesProvider kubernetesProvider = cloudProviderManager.getCloudProvider("fit2cloud-kubernetes-plugin");
                        KubernetesClient client = kubernetesProvider.getKubernetesClient(credential);
                        VersionInfo versionInfo = client.getVersion();
                        dashboardClusterDTO.setVersion(versionInfo.getGitVersion());

                        if (client.nodes() == null) {
                            LogUtil.getLogger().info(cloudAccount.getName() + "has no nodes.");
                            continue;
                        }

                        NodeList nodeList = client.nodes().list();
                        List<Node> nodes = nodeList.getItems();
                        LogUtil.getLogger().info("getItems end, nodes are:", nodes);

                        for (Node node : nodes) {
                            if (node.getMetadata().getSelfLink().contains("master") && node.getStatus() != null) {
                                ++masterNum;
                            }
                        }
                        if (masterNum > 1) {
                            dashboardClusterDTO.setDeployType(MULTIPLE_MASTERS);
                        } else {
                            dashboardClusterDTO.setDeployType(ONE_MASTER);
                        }
                    } catch (Exception e) {
                        LogUtil.getLogger().error("Failed to connect to:" + cloudAccount.getName(), e);
                        continue;
                    }
                }
            }
        }

        return dashboardClusters;
        //return dashboardClusters.stream().filter(dashboardClusterDTO -> dashboardClusterDTO.getProject() > 0).collect(Collectors.toList());
    }

    public void convertParam(Map<String, Object> param) {
        SessionUser user = SessionUtils.getUser();
        if (StringUtils.equals(user.getParentRoleId(), RoleConstants.Id.ORGADMIN.name())) {
            String organizationId = user.getOrganizationId();
            WorkspaceExample workspaceExample = new WorkspaceExample();
            workspaceExample.createCriteria().andOrganizationIdEqualTo(organizationId);
            List<Workspace> workspaces = workspaceMapper.selectByExample(workspaceExample);
            List<String> list = workspaces.stream().map(Workspace::getId).collect(Collectors.toList());
            if (CollectionUtils.isEmpty(list)) {
                //避免没有工作空间 组织管理员查询全部
                list.add(UUIDUtil.newUUID());
            }
            param.put("workspaceIds", list);
        } else if (StringUtils.equals(user.getParentRoleId(), RoleConstants.Id.USER.name())) {
            param.put("workspaceId", user.getWorkspaceId());
        }
    }

    private Map<String, Object> convert2Map(Map<String, Object> map) {

        SessionUser user = SessionUtils.getUser();
        List<String> projects = new ArrayList<>();
        List<String> workspaceIds = new ArrayList<>();
        if (StringUtils.equals(user.getParentRoleId(), RoleConstants.Id.ORGADMIN.name())) {
            String organizationId = user.getOrganizationId();
            WorkspaceExample workspaceExample = new WorkspaceExample();
            workspaceExample.createCriteria().andOrganizationIdEqualTo(organizationId);
            List<Workspace> workspaces = workspaceMapper.selectByExample(workspaceExample);
            workspaceIds.addAll(workspaces.stream().map(Workspace::getId).collect(Collectors.toList()));
        } else if (StringUtils.equals(user.getParentRoleId(), RoleConstants.Id.USER.name())) {
            workspaceIds.add(user.getWorkspaceId());
        } else {
            return map;
        }

        map.put("projects", projects);

        if (CollectionUtils.isNotEmpty(workspaceIds)) {
            CsProjectExample csProjectExample = new CsProjectExample();
            csProjectExample.createCriteria().andWorkspaceIdIn(workspaceIds);
            List<CsProject> csProjects = csProjectMapper.selectByExample(csProjectExample);
            projects.addAll(csProjects.stream().map(CsProject::getId).collect(Collectors.toSet()));
        }

        if (CollectionUtils.isEmpty(projects)) {
            projects.add(UUIDUtil.newUUID());
        }

        return map;
    }

    /**
     * 获取集群状态
     * @return
     */
    public List<ChartData> getClusterStatus(Map<String, Object> param) {
        CloudAccountExample cloudAccountExample = new CloudAccountExample();
        List<CloudAccount> cloudAccounts = cloudAccountMapper.selectByExample(cloudAccountExample);
        if (CollectionUtils.isEmpty(cloudAccounts)) {
            LogUtil.getLogger().error("cloudAccounts are empty.");
            return null;
        }

        List<ChartData> result = new ArrayList<>();
        Map<String, Integer> listMap = new HashMap<String, Integer>();
        Integer normalCount = 0;
        Integer abnormalCount = 0;
        for (CloudAccount cloudAccount : cloudAccounts) {
            if (param.size() != 0 && !cloudAccount.getId().equals(param.get("accountId"))) {
                continue;
            }

            if ("INVALID".equals(cloudAccount.getStatus())) {
                listMap.put("abnormal", ++abnormalCount);
            } else {
                listMap.put("normal", ++normalCount);
            }
        }
        for (String key : listMap.keySet()) {
            ChartData chartData = new ChartData();
            chartData.setyAxis(new BigDecimal(listMap.get(key)));
            chartData.setGroupName(key);

            result.add(chartData);
        }
        return result;
    }

    /**
     * 获取状master态
     * @return
     */
    public List<ChartData> getMasterStatus(Map<String, Object> param) {
        Integer normalNum = 0;
        Integer abnormalNum = 0;
        List<ChartData> result = new ArrayList<>();

        CloudAccountExample cloudAccountExample = new CloudAccountExample();
        List<CloudAccount> cloudAccounts = cloudAccountMapper.selectByExample(cloudAccountExample);
        if (CollectionUtils.isEmpty(cloudAccounts)) {
            LogUtil.getLogger().error("cloudAccounts are empty.");
            return null;
        }
        for (CloudAccount cloudAccount : cloudAccounts) {
            if (!"fit2cloud-kubernetes-plugin".equals(cloudAccount.getPluginName())) {
                LogUtil.getLogger().error("This plugin is not kubernetes.");
                continue;
            }
            if (param.size() != 0 && !cloudAccount.getId().equals(param.get("accountId"))) {
                continue;
            }
            if (cloudAccount.getStatus().equals("INVALID")) {
                continue;
            }

            try {
                String credential = cloudAccount.getCredential();
                KubernetesProvider kubernetesProvider = cloudProviderManager.getCloudProvider("fit2cloud-kubernetes-plugin");
                KubernetesClient client = kubernetesProvider.getKubernetesClient(credential);
                LogUtil.getLogger().info("Master getKubernetesClient end, client is:", client);

                if (client.nodes() == null) {
                    LogUtil.getLogger().info(cloudAccount.getName() + "has no nodes.");
                    continue;
                }
                NodeList nodeList = client.nodes().list();
                List<Node> nodes = nodeList.getItems();
                LogUtil.getLogger().info("getItems end, nodes are:", nodes);

                for (Node node : nodes) {
                    Map<String, String> labelsMap = node.getMetadata().getLabels();
                    Set<Map.Entry<String, String>> labelsSet = labelsMap.entrySet();
                    boolean isWorker = true;
                    for (Map.Entry<String, String> label : labelsSet){
                        if (label.getKey().contains("master") || label.getValue().contains("master")) {
                            isWorker = false;
                        }
                    }
                    if (node.getMetadata().getSelfLink().contains("master") || !isWorker) {
                        if (isHealthy(node)) {
                            ++normalNum;
                        } else {
                            ++abnormalNum;
                        }
                    }
                }
            } catch (Exception e) {
                LogUtil.getLogger().error("Failed to connect to:" + cloudAccount.getName(), e);
                continue;
            }

        }
        Map<String, Integer> listMap = new HashMap<>();
        listMap.put("normal", normalNum);
        listMap.put("abnormal",abnormalNum);
        for (String key : listMap.keySet()) {
            ChartData chartData = new ChartData();
            chartData.setyAxis(new BigDecimal(listMap.get(key)));
            chartData.setGroupName(key);
            result.add(chartData);
        }
        return result;
    }

    /**
     * describtion 判断node是否健康
     * date 2020.07.03
     * author maoping
     * param node node节点：master or worker
     * return ture or false
     *
     * */
    private boolean isHealthy(Node node) {
        if (null != node.getStatus()) {
            for (NodeCondition nodeCondition : node.getStatus().getConditions()) {
                if (READY.equals(nodeCondition.getType()) && TRUE.equals(nodeCondition.getStatus())) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 获取worker状态
     * @return
     */
    public List<ChartData> getWorkerStatus(Map<String, Object> param) {
        Integer normalNum = 0;
        Integer abnormalNum = 0;
        List<ChartData> result = new ArrayList<>();

        CloudAccountExample cloudAccountExample = new CloudAccountExample();
        List<CloudAccount> cloudAccounts = cloudAccountMapper.selectByExample(cloudAccountExample);
        if (CollectionUtils.isEmpty(cloudAccounts)) {
            LogUtil.getLogger().error("cloudAccounts are empty.");
            return null;
        }
        for (CloudAccount cloudAccount : cloudAccounts) {
            if (!"fit2cloud-kubernetes-plugin".equals(cloudAccount.getPluginName())) {
                LogUtil.getLogger().error("This plugin is not kubernetes.");
                continue;
            }

            if (param.size() != 0 && !cloudAccount.getId().equals(param.get("accountId"))) {
                continue;
            }

            try {
                String credential = cloudAccount.getCredential();
                KubernetesProvider kubernetesProvider = cloudProviderManager.getCloudProvider("fit2cloud-kubernetes-plugin");
                KubernetesClient client = kubernetesProvider.getKubernetesClient(credential);
                LogUtil.getLogger().info("Worker getKubernetesClient end, client is:", client);

                NodeList nodeList = client.nodes().list();
                List<Node> nodes = nodeList.getItems();
                LogUtil.getLogger().info("getItems end, nodes are:", nodes);

                for (Node node : nodes) {
                    Map<String, String> labelsMap = node.getMetadata().getLabels();
                    Set<Map.Entry<String, String>> labelsSet = labelsMap.entrySet();
                    boolean isWorker = true;
                    for (Map.Entry<String, String> label : labelsSet) {
                        if (label.getKey().contains("master") || label.getValue().contains("master")) {
                            isWorker = false;
                        }
                    }
                    if (!node.getMetadata().getSelfLink().contains("master") && isWorker) {
                        if (isHealthy(node)) {
                            ++normalNum;
                        } else {
                            ++abnormalNum;
                        }
                    }
                }
            } catch (Exception e) {
                LogUtil.getLogger().error("Failed to connect to:" + cloudAccount.getName(), e);
                continue;
            }

        }
        Map<String, Integer> listMap = new HashMap<>();
        listMap.put("normal", normalNum);
        listMap.put("abnormal",abnormalNum);
        for (String key : listMap.keySet()) {
            ChartData chartData = new ChartData();
            chartData.setyAxis(new BigDecimal(listMap.get(key)));
            chartData.setGroupName(key);
            result.add(chartData);
        }
        return result;
    }

    /**
     * 获取master上api-server和proxy服务状态是否正常
     * @return
     */
    public ComponentStatusDTO getPodStatus(Map<String, Object> param) {
        ComponentStatusDTO componentStatusDTO;
        String nodeType = (String)param.get("nodeType");
        String cloudAccountId = (String)param.get("cloudAccountId");
        componentStatusDTO = getNum(cloudAccountId, nodeType);
        return componentStatusDTO;
    }

    //api-server和proxy状态数目
    private ComponentStatusDTO getNum (String cloudAccountId, String nodeType) {
        ComponentStatusDTO componentStatusDTO = new ComponentStatusDTO();
        if (StringUtils.isBlank(cloudAccountId) || StringUtils.isBlank(nodeType)) {
            return componentStatusDTO;
        }

        AtomicReference<Integer> healthyNum = new AtomicReference<>(0);
        AtomicReference<Integer> unhealthyNum = new AtomicReference<>(0);
        CloudAccountExample cloudAccountExample = new CloudAccountExample();
        List<CloudAccount> cloudAccounts = cloudAccountMapper.selectByExample(cloudAccountExample);
        if (CollectionUtils.isEmpty(cloudAccounts)) {
            return componentStatusDTO;
        }

        for (CloudAccount cloudAccount : cloudAccounts) {
            if (cloudAccountId.equals(cloudAccount.getName())) {
                String credential = cloudAccount.getCredential();
                KubernetesProvider kubernetesProvider = cloudProviderManager.getCloudProvider("fit2cloud-kubernetes-plugin");
                try {
                    if (kubernetesProvider.validateCredential(credential)) {
                        KubernetesClient client = kubernetesProvider.getKubernetesClient(credential);

                        if (cloudAccount.getStatus().equals("INVALID")) {
                            continue;
                        }
                        /* 获取所有pod对象 */
                        PodList podList = client.pods().list();
                        List<Pod> pods = podList.getItems();
                        pods.forEach(pod -> {
                            if (pod.getMetadata().getName().contains(nodeType)) {
                                if ("Running".equals(pod.getStatus().getPhase())) {
                                    healthyNum.getAndSet(healthyNum.get() + 1);
                                } else {
                                    unhealthyNum.getAndSet(unhealthyNum.get() + 1);
                                }
                            }
                        });
                    }
                } catch (Exception e) {
                    LogUtil.getLogger().error("Failed to connect to:" + cloudAccount.getName(), e);
                    continue;
                }
            }
        }
        componentStatusDTO.setNormalNumr(healthyNum.get());
        componentStatusDTO.setAbnormalNum(unhealthyNum.get());
        return componentStatusDTO;
    }

    /**
     * 获取master上服务状态是否正常
     * @return
     */
    public ComponentStatusDTO getMasterServices(Map<String, Object> param) {
        ComponentStatusDTO componentStatusDTO;
        String nodeType = (String)param.get("nodeType");
        String cloudAccountId = (String)param.get("cloudAccountId");
        componentStatusDTO = getHealthyNum(cloudAccountId, nodeType);
        return componentStatusDTO;
    }

    /**
     * 获取集群master正常状态的组件数目
     * @return
     */
    private ComponentStatusDTO getHealthyNum (String cloudAccountId, String nodeType) {
        ComponentStatusDTO componentStatusDTO = new ComponentStatusDTO();
        if (StringUtils.isBlank(cloudAccountId) || StringUtils.isBlank(nodeType)) {
            return componentStatusDTO;
        }

        Integer healthyNum = 0;
        Integer unhealthyNum = 0;
        CloudAccountExample cloudAccountExample = new CloudAccountExample();
        List<CloudAccount> cloudAccounts = cloudAccountMapper.selectByExample(cloudAccountExample);
        if (CollectionUtils.isEmpty(cloudAccounts)) {
            return componentStatusDTO;
        }

        for (CloudAccount cloudAccount : cloudAccounts) {
            if (cloudAccountId.equals(cloudAccount.getName())) {
                String credential = cloudAccount.getCredential();
                KubernetesProvider kubernetesProvider = cloudProviderManager.getCloudProvider("fit2cloud-kubernetes-plugin");
                try {
                    if (kubernetesProvider.validateCredential(credential)) {
                        KubernetesClient client = kubernetesProvider.getKubernetesClient(credential);
                        ComponentStatusList componentStatusList = client.componentstatuses().list();
                        List<ComponentStatus> items = componentStatusList.getItems();

                        if (CollectionUtils.isNotEmpty(items)) {
                            for (ComponentStatus componentStatus : items) {
                                List<ComponentCondition> componentConditions = componentStatus.getConditions();
                                if (componentStatus.getMetadata().getName().contains(nodeType) && CollectionUtils.isNotEmpty(componentConditions)) {
                                    for (ComponentCondition componentCondition : componentConditions) {
                                        if (HEALTHY.equals(componentCondition.getType()) && TRUE_STATUS.equals(componentCondition.getStatus())) {
                                            healthyNum++;
                                        } else {
                                            unhealthyNum++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    LogUtil.getLogger().error("Failed to connect to:" + cloudAccount.getName(), e);
                    continue;
                }
            }
        }
        componentStatusDTO.setNormalNumr(healthyNum);
        componentStatusDTO.setAbnormalNum(unhealthyNum);
        return componentStatusDTO;
    }

    private List<DashboardClusterDTO> matchWorkspaces(List<DashboardClusterDTO> dashboardClusters) {
        SessionUser su = SessionUtils.getUser();
        String parentRoleId = su.getParentRoleId();
        String id;
        if (USER.equals(parentRoleId)) {
            id = su.getWorkspaceId();
        } else if (ORG_ADMIN.equals(parentRoleId)) {
            id = su.getOrganizationId();
        } else {
            return dashboardClusters;
        }

        List<DashboardClusterDTO> clusters = new ArrayList<>();
        for (DashboardClusterDTO dashboardClusterDTO : dashboardClusters) {
            DashboardClusterDTO clusterAuth = extClusterMapper.queryAuthClusters(dashboardClusterDTO.getCloudAccountId());
            if (clusterAuth != null
                    && (clusterAuth.getOrganizationId().equals(id)
                    || clusterAuth.getWorkspaceId().equals(id))) {
                clusters.add(dashboardClusterDTO);
            }
        }
        return clusters;
    }
}
