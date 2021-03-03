package com.fit2cloud.fks.service;

import com.alibaba.fastjson.JSON;

import com.alibaba.fastjson.JSONObject;
import com.fit2cloud.commons.pluginmanager.CloudProviderManager;
import com.fit2cloud.commons.server.base.domain.CloudAccount;
import com.fit2cloud.commons.server.base.domain.CloudAccountExample;
import com.fit2cloud.commons.server.base.domain.Workspace;
import com.fit2cloud.commons.server.base.domain.WorkspaceExample;
import com.fit2cloud.commons.server.base.mapper.CloudAccountMapper;
import com.fit2cloud.commons.server.base.mapper.WorkspaceMapper;
import com.fit2cloud.commons.server.constants.RoleConstants;
import com.fit2cloud.commons.server.exception.F2CException;
import com.fit2cloud.commons.server.model.ChartData;
import com.fit2cloud.commons.server.model.SessionUser;
import com.fit2cloud.commons.server.utils.SessionUtils;
import com.fit2cloud.commons.utils.LogUtil;
import com.fit2cloud.commons.utils.UUIDUtil;
import com.fit2cloud.fks.dao.CsProjectMapper;
import com.fit2cloud.fks.dao.ExtClusterMapper;
import com.fit2cloud.fks.dao.KoSpecsMapper;
import com.fit2cloud.fks.dto.*;
import com.fit2cloud.fks.model.CsProject;
import com.fit2cloud.fks.model.CsProjectExample;
import com.fit2cloud.plugin.container.k8s.KubernetesProvider;
import com.google.gson.JsonObject;
import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.client.Config;
import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.kubernetes.client.DefaultKubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClient;
import com.fit2cloud.commons.server.redis.map.RedisMessageMap;
import com.fit2cloud.fks.common.constants.UrlConstant;
import com.fit2cloud.fks.common.utils.HttpUtil;
import com.fit2cloud.fks.dao.KoSettingsMapper;
import com.fit2cloud.fks.dto.response.*;
import com.fit2cloud.fks.model.KoSettings;
import okhttp3.*;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.junit.Test;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

import org.apache.commons.lang.StringEscapeUtils;

@Service
public class KoService {
    @Resource
    private CloudAccountMapper cloudAccountMapper;

    @Resource
    private KoSettingsMapper koSettingsMapper;

    @Resource
    private RedisMessageMap redisMessageMap;

    @Resource
    private KoSpecsMapper koSpecsMapper;

    private static final String KO_HEADER_PREFIX = "JWT ";

    private static final String METHOD_POST = "POST";

    private static final String METHOD_GET = "GET";

    /**
     * 获取可用的集群信息
     * @return
     */
    public List<YamlDeployClusterInfo> listYamlClusters(){
        CloudAccountExample example = new CloudAccountExample();
        List<CloudAccount> cloudAccountList = cloudAccountMapper.selectByExample(example);
        List<YamlDeployClusterInfo> list = cloudAccountList.stream().map(cloudAccount->{
            //String credential = cloudAccount.getCredential();
            //KoCredential koCredential = JSONObject.parseObject(credential,KoCredential.class);
            YamlDeployClusterInfo yamlDeployClusterInfo = new YamlDeployClusterInfo();
            yamlDeployClusterInfo.setClusterId(cloudAccount.getId());
            yamlDeployClusterInfo.setClusterName(cloudAccount.getName());
            //yamlDeployClusterInfo.setMasterUrl(koCredential.getMasterUrl());
            //yamlDeployClusterInfo.setToken(koCredential.getToken());
            return yamlDeployClusterInfo;
        }).collect(Collectors.toList());

        return list;
    }

    /**
     * 封装一层ko response
     * @param url
     * @param form
     * @param headers
     * @return
     * @throws Exception
     */
    private Response getKoResponse(String url, RequestBody form, Map<String, String> headers,String method) throws Exception {
        if (method.equals(METHOD_POST)) {
            Response response = HttpUtil.getResp(new Request.Builder()
                    .url(url)
                    .headers(Headers.of(headers))
                    .post(form)
                    .build());

            return response;
        }else if(method.equals(METHOD_GET)) {
            Response response = HttpUtil.getResp(new Request.Builder()
                    .url(url)
                    .headers(Headers.of(headers))
                    .get()
                    .build());

            return response;
        }

        return null;
    }

    /**
     * 封装一层加token的header
     * @return
     * @throws Exception
     */
    private Map<String, String> getHeaders() throws Exception{
        Map<String, String> headers = new HashMap<>();
        String token = getToken();
        headers.put("Authorization", KO_HEADER_PREFIX + token);
        headers.put("Connection", "close");
        return headers;
    }

    /**
     * 获取ko api token
     * @return
     * @throws Exception
     */
    private String getToken() throws Exception {
        KoSettings settings = koSettingsMapper.selectByPrimaryKey(1);
        Map<String, String> headers = new HashMap<>();
        RequestBody form = new FormBody.Builder()
                .add("username", settings.getKoAdmin())
                .add("password", settings.getAdminPassword())
                .build();

        Response response = getKoResponse(getUrl(UrlConstant.API_TOKEN_AUTH),form,headers,METHOD_POST);
        ResponseBody responseBody = response.body();
        String data = responseBody.string();
        KoAuthBean bean = JSON.parseObject(data,KoAuthBean.class);

        return bean.getToken();
    }

    /**
     * 获取集群信息
     * @throws Exception
     */
    public List<KoClustersBean> getClusters() throws Exception{
        Map<String, String> headers = getHeaders();
        RequestBody form = new FormBody.Builder().build();

        Response response = getKoResponse(getUrl(UrlConstant.CLUSTERS),form,headers,METHOD_GET);
        ResponseBody responseBody = response.body();
        String data = responseBody.string();

        List<KoClustersBean> bean = JSON.parseArray(data, KoClustersBean.class);

        return bean;
    }

    /**
     * 获取集群节点信息
     * @param cluster_name
     * @return
     * @throws Exception
     */
    public List<KoClusterNodesBean> getClusterNodes(String cluster_name) throws Exception{
        String url = String.format(UrlConstant.CLUSTER_NODES,cluster_name);
        Map<String, String> headers = getHeaders();
        RequestBody form = new FormBody.Builder().build();

        Response response = getKoResponse(getUrl(url),form,headers,METHOD_GET);
        ResponseBody responseBody = response.body();
        String data = responseBody.string();

        List<KoClusterNodesBean> bean = JSON.parseArray(data, KoClusterNodesBean.class);

        //筛选master或者worker
        List<KoClusterNodesBean> result = bean.stream().filter(koClusterNodesBean->
            koClusterNodesBean.getRoles().contains("master") || koClusterNodesBean.getRoles().contains("worker")
        ).collect(Collectors.toList());

        return result;
    }

    /**
     * 获取概览
     * @throws Exception
     */
    public KoDashboardBean getDashboard() throws Exception{
        String url = String.format(UrlConstant.DASHBOARD,"all");
        Map<String, String> headers = getHeaders();
        RequestBody form = new FormBody.Builder().build();

        Response response = getKoResponse(getUrl(url),form,headers,METHOD_GET);
        ResponseBody responseBody = response.body();
        String data = responseBody.string();
        String data1 = StringEscapeUtils.unescapeJavaScript(data);

        KoDashboardBean bean = JSON.parseObject(data1, KoDashboardBean.class);

        return bean;
    }

    /**
     * 获取ko配置
     * @return
     */
    public KoSettings getKoSettings(){
        KoSettings settings = koSettingsMapper.selectByPrimaryKey(1);
        if(Objects.isNull(settings)){
            return new KoSettings();
        }
        return settings;
    }

    /**
     * 更新ko配置
     * @param koSettings
     */
    public void updateKoSettings(KoSettings koSettings){
        KoSettings settings = koSettingsMapper.selectByPrimaryKey(1);
        if(Objects.isNull(settings)){
            koSettingsMapper.insertSelective(koSettings);
        }else{
            koSettings.setId(1);
            koSettingsMapper.updateByPrimaryKey(koSettings);
        }
    }

    /**
     * 保存规格设置
     * @param param
     */
    public int saveSpecs(Map<String, Object> param){
        SpecsDTO specsDTO = new SpecsDTO();
        specsDTO.setSpecsId(UUIDUtil.newUUID());
        specsDTO.setSpecsName((String) param.get("specsName"));
        specsDTO.setNodeNum((String) param.get("nodeNum"));
        specsDTO.setZone((String)param.get("zone"));
        specsDTO.setDeployType((String)param.get("deployType"));

        return koSpecsMapper.saveKoSpecs(specsDTO);
    }

    /**
     * 获取规格列表
     * @param
     */
    public List<SpecsDTO> querySpecs(){
        return koSpecsMapper.queryKoSpecsList();
    }

    /**
     * 删除规格
     * @param param
     */
    public int deleteSpecs(Map<String, Object> param){
        if (param == null || param.size() == 0) {
            F2CException.throwException("没有选择规格");
        }

        return koSpecsMapper.deleteKoSpecs((String)param.get("specsId"));
    }

    /**
     * 获取ko机器的ip
     * @return
     */
    private String getKoAddress(){
        return koSettingsMapper.selectByPrimaryKey(1).getKoAddress();
    }

    /**
     *
     * @return
     */
    private String getUrl(String baseApi){
        return "http://" + getKoAddress()+ ":8000/api/v1" + baseApi;
    }

}
