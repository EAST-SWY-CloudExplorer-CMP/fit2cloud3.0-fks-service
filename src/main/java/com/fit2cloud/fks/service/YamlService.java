package com.fit2cloud.fks.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.fit2cloud.commons.server.base.domain.CloudAccount;
import com.fit2cloud.commons.server.base.domain.CloudAccountExample;
import com.fit2cloud.commons.server.base.domain.FileStore;
import com.fit2cloud.commons.server.base.domain.FileStoreExample;
import com.fit2cloud.commons.server.base.mapper.CloudAccountMapper;
import com.fit2cloud.commons.server.base.mapper.FileStoreMapper;
import com.fit2cloud.commons.utils.BeanUtils;
import com.fit2cloud.commons.utils.LogUtil;
import com.fit2cloud.fks.dao.YamlHistroryMapper;
import com.fit2cloud.fks.dao.YamlRepositoryMapper;
import com.fit2cloud.fks.dao.ext.ExtYamlRepositoryMapper;
import com.fit2cloud.fks.dto.KoCredential;
import com.fit2cloud.fks.dto.YamlDeployInfo;
import com.fit2cloud.fks.dto.request.ListReposRequest;
import com.fit2cloud.fks.model.YamlHistrory;
import com.fit2cloud.fks.model.YamlHistroryExample;
import com.fit2cloud.fks.model.YamlRepository;
import com.fit2cloud.fks.model.YamlRepositoryExample;
import io.fabric8.kubernetes.api.model.HasMetadata;
import io.fabric8.kubernetes.client.Config;
import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.kubernetes.client.DefaultKubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClient;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import javax.annotation.Resource;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.*;

@Service
@SpringBootApplication
public class YamlService {
    @Resource
    private CloudAccountMapper cloudAccountMapper;

    @Resource
    private YamlHistroryMapper yamlHistroryMapper;

    @Resource
    private YamlRepositoryMapper yamlRepositoryMapper;

    @Resource
    private FileStoreMapper fileStoreMapper;

    @Resource
    private ExtYamlRepositoryMapper extYamlRepositoryMapper;

    //private static final String YAML_BASE_DIR = "/opt/fit2cloud/yamlrepo/";

    /**
     * 获取yaml仓库
     * @return
     */
    public List<YamlRepository> listRepository(ListReposRequest listReposRequest){
        listReposRequest.setName(StringUtils.wrapIfMissing(listReposRequest.getName(), "%"));
        listReposRequest.setVersion(StringUtils.wrapIfMissing(listReposRequest.getVersion(), "%"));
        return extYamlRepositoryMapper.listRepository(listReposRequest);
    }

    /**
     * 获取businessKey
     * @return
     */
    public Integer getBusinessKey(){
        Random random = new Random();
        return random.nextInt();
    }

    /**
     * 获取yaml部署结果
     * @return
     */
    public List<YamlHistrory> getHistory() {
        YamlHistroryExample example = new YamlHistroryExample();

        return yamlHistroryMapper.selectByExample(example);
    }

    /**
     * 新建yaml仓库
     * @return
     */
    public Integer yamlCreate(){
        YamlRepository yamlRepository = new YamlRepository();
//        yamlRepository.setYamlContent(new byte[1]);
        yamlRepository.setDescription("");
        yamlRepository.setName("");
        yamlRepository.setVersion("");
        Random random = new Random();
        yamlRepository.setId(random.nextInt());
        yamlRepositoryMapper.insertSelective(yamlRepository);
        return yamlRepository.getId();
    }

    /**
     * 编辑yaml仓库
     * @param yamlRepository
     */
    public void yamlEdit(YamlRepository yamlRepository) throws Exception {
        if (yamlRepository == null) {
            return;
        }
        yamlRepositoryMapper.deleteByPrimaryKey(yamlRepository.getId());

        List<FileStore> fileStores = getInputStream(String.valueOf(yamlRepository.getId()));
        if (CollectionUtils.isNotEmpty(fileStores)) {
            for (FileStore f : fileStores) {
                YamlRepository yaml = new YamlRepository();
                BeanUtils.copyBean(yaml, yamlRepository);

                byte[] file = f.getFile();
                InputStream inputStream = new ByteArrayInputStream(file);
                yaml.setName(readYaml("name", inputStream));
                inputStream = new ByteArrayInputStream(file);
                yaml.setVersion(readYaml("version", inputStream));
                yaml.setYamlContent(f.getFile());

                yamlRepositoryMapper.insertSelective(yaml);
            }
        } else {
            throw new Exception("请选择文件");
        }
    }

    /**
     * 删除yaml仓库
     * @return
     */
    public void yamlDelete(Integer id){
        yamlRepositoryMapper.deleteByPrimaryKey(id);
    }

    /**
     * 部署yaml文件并入库
     * @param yamlRepositorys
     */
    public Boolean yamlDeploy(List<YamlRepository> yamlRepositorys){
        if (CollectionUtils.isEmpty(yamlRepositorys)) {
            return false;
        }

        //先取集群（云账号）信息
        CloudAccountExample example = new CloudAccountExample();
        CloudAccountExample.Criteria criteria = example.createCriteria();
        //同一批yaml部署时所选的是同一个集群，故先取出共同的集群（云账号）信息
        criteria.andIdEqualTo(yamlRepositorys.get(0).getClusterId());
        List<CloudAccount> cloudAccountList = cloudAccountMapper.selectByExample(example);
        CloudAccount cloudAccount = cloudAccountList.get(0);
        String credential = cloudAccount.getCredential();
        KoCredential koCredential = JSONObject.parseObject(credential,KoCredential.class);

        for (YamlRepository yamlRepository : yamlRepositorys) {
            List<YamlRepository> exeYamls = extYamlRepositoryMapper.selectByNameAndVersion(yamlRepository.getName(), yamlRepository.getVersion());

            if (CollectionUtils.isNotEmpty(exeYamls)) {
                byte[] file = exeYamls.get(0).getYamlContent();
                InputStream inputStream = new ByteArrayInputStream(file);

                Object object = null;
                YamlHistrory yamlHistrory = new YamlHistrory();
                yamlHistrory.setClusterId(yamlRepository.getClusterId());
                yamlHistrory.setClusterName(cloudAccount.getName());
                yamlHistrory.setMasterUrl(koCredential.getMasterUrl());
                yamlHistrory.setToken(koCredential.getToken());
                yamlHistrory.setRepoId(yamlRepository.getId());
                yamlHistrory.setRepoName(yamlRepository.getName());
                yamlHistrory.setYamlFile(file);
                yamlHistrory.setCreateTime(new Date());//开始时间

                Config config = new ConfigBuilder().withMasterUrl(koCredential.getMasterUrl())
                        .withOauthToken(koCredential.getToken())
                        .withTrustCerts(true)
                        .build();
                KubernetesClient client = new DefaultKubernetesClient(config);
                try {
                    List<HasMetadata> result = client.load(inputStream).get();
                    object = client.resourceList(result).createOrReplace();
                }catch (Exception e){
                    yamlHistrory.setStatus(false);
                    yamlHistrory.setMessage(e.getMessage());
                    yamlHistroryMapper.insertSelective(yamlHistrory);
                    return false;
                }

                String message = "";

                if(object instanceof HasMetadata){
                    HasMetadata metadata = (HasMetadata)object;
                    message = JSONObject.toJSONString(message);
                    System.out.println(metadata);
                }else if(object instanceof List){
                    List<HasMetadata> list = (List<HasMetadata>)object;
                    for(HasMetadata hasMetadata : list){
                        message += JSONObject.toJSONString(hasMetadata);
                        System.out.println(hasMetadata);
                    }
                }

                yamlHistrory.setStatus(true);
                yamlHistrory.setMessage(message);

                yamlHistroryMapper.insertSelective(yamlHistrory);
            }
        }

        return true;
    }

    /**
     * 通过yaml的id获取byte数组的yaml文件内容
     * @param yamlRepoId
     * @return
     */
    public List<FileStore> getInputStream(String yamlRepoId) {
        FileStoreExample example2 = new FileStoreExample();
        FileStoreExample.Criteria criteria2 = example2.createCriteria();
        criteria2.andBusinessKeyEqualTo(yamlRepoId);
        List<FileStore> fileStores = fileStoreMapper.selectByExampleWithBLOBs(example2);
//        byte[] file = fileStores.get(0).getFile();
        return fileStores;
    }

    /**
     * 解析yaml文件--sf
     * @param value
     * @return
     */
    private String readYaml(String value, InputStream inputStream) {
        try {
            Map yamlMap;
            Yaml yaml = new Yaml();
            String version = "";
            String appName = "";

            //也可以将值转换为Map
            yamlMap = yaml.load(inputStream);
            //通过map我们取值就可以了.
            if ("name".equals(value)) {
                if (yamlMap.get("metadata") instanceof Map) {
                    Map metadata  = (Map)yamlMap.get("metadata");
                    if (metadata.get("name") instanceof String) {
                        appName = (String)metadata.get(value);
                        return appName;
                    }
                }
            }

            if ("version".equals(value)) {
                if (yamlMap.get("metadata") instanceof Map) {
                    Map metadata  = (Map)yamlMap.get("metadata");
                    if (metadata.get("labels") instanceof Map) {
                        Map labels  = (Map)metadata.get("labels");
                        if (labels.get("version") != null) {
                            String appVersion = (String) labels.get("version");
                            version = String.valueOf(appVersion);
                            return version;
                        }
                    }
                }
            }
        } catch (ClassCastException e) {
            LogUtil.error("java.lang.String cannot be cast to java.util.Map.");
        } catch (NumberFormatException es) {
            LogUtil.error("Cast failed.");
        }
        return "";
    }

    /**
     * 根据仓库的id获取转换好的yaml路径
     * @param id
     * @return
     */
    public String getYamlFilebyId(Integer id){
        YamlRepository yamlRepository = yamlRepositoryMapper.selectByPrimaryKey(id);
        return "";
    }

    private void yamlToJson(){

    }

    private void jsonToYaml(String json){
        Map maps = (Map) JSON.parse(json);
        System.currentTimeMillis();
    }

//    @Test
//    public void contextLoads() {
//        Yaml yaml = new Yaml();
//        org.springframework.core.io.Resource resource = new ClassPathResource("b.yaml"); //读取resources文件夹中的yaml文件
//        Object result = null;
//        InputStream in = null;
//        try {
////            File file = resource.getFile();
//            File dumpfile = new File("C:\\Users\\zhaocheng\\Desktop\\k8s-test-deploy.yaml");
//            in = new FileInputStream(dumpfile);
//            result = yaml.load(in);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }finally {
//            try {
//                if (in != null){
//                    in.close();
//                }
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//        }
//        Map<String,String> resmap = (Map<String, String>) result;
//        System.out.println(JSONObject.toJSONString(resmap));
//
////        将数据写入yaml文件
//        DumperOptions dumperOptions = new DumperOptions();
//        dumperOptions.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
//        Yaml wyaml = new Yaml(dumperOptions);
//        File dumpfile = new File("C:\\Users\\zhaocheng\\Desktop\\k8s-test-deploy2.yaml");
//        try(FileWriter writer = new FileWriter(dumpfile)) {
//            wyaml.dump(resmap, writer);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }

    /*@Test
    public void yamlDeploy1() {
        String token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJrdWJlcm5ldGVzLWRhc2hib2FyZC10b2tlbi14bDVrNiIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjAxYWM3ZjVhLTBjMDktNGI1MS1hMmZhLTI4ZmYzOGZlZTg2MSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlLXN5c3RlbTprdWJlcm5ldGVzLWRhc2hib2FyZCJ9.a_UjCrTST1w1aPcPyn-WT0mNXt9gK9Zzqlrqt6PzuAze3AkxZzh65b2B2_MU8jRhvMEX4684BuPGc51BMjw7p2NvswbmLYolZQMBGI5nI4pjfiUKGYzvnle3IC0u2Vt649voC8rpoumVZLH8GP74Q7o7aDnNu_Dl0YKBWD_hMd0h8aLFs4QrMF0VLYUtPXBa1bR2jUA-7LxvNl_bwstqnlsBrdhNAwP6LXvY17sKycF-5_4vD1yWbJOj6BK5sjbTO11iRC96BuV4TTdXl9fJhDa0bc0lD-Krb3vNFdUA3Q0DBKvNxBygmjhtufx1-R-aLUS89ulh8nJA2gkZ-mj3dw";
        Config config = new ConfigBuilder().withMasterUrl("https://10.1.10.216:6443")
                .withOauthToken(token)
                .withTrustCerts(true)
                .build();
        KubernetesClient client = new DefaultKubernetesClient(config);
        List<Namespace> namespaces = client.namespaces().list().getItems();
        for(Namespace namespace : namespaces){
            System.out.println(namespace.getMetadata().getName());
        }
        System.out.println("start : " + client.apps().deployments().list().getItems().size());

        //client.load
        YamlRepository yamlRepository = yamlRepositoryMapper.selectByPrimaryKey(1);
        FileStoreExample example = new FileStoreExample();
        FileStoreExample.Criteria criteria = example.createCriteria();
        criteria.andBusinessKeyEqualTo(yamlRepository.getId().toString());
        List<FileStore> fileStores = fileStoreMapper.selectByExampleWithBLOBs(example);
        InputStream inputStream = new ByteArrayInputStream(fileStores.get(0).getFile());
        Yaml yaml = new Yaml();
        //Object object1 = yaml.load(inputStream);
        //Map<String,String> resmap = null;// (Map<String, String>) yamlRepository.getYamlContent();
        //System.out.println(JSONObject.toJSONString(resmap));
        List<HasMetadata> result = client.load(inputStream).get();

        Object object = client.resourceList(result).createOrReplace();

        if(object instanceof HasMetadata){
            HasMetadata metadata = (HasMetadata)object;
            System.out.println(metadata);
        }else if(object instanceof List){
            List<HasMetadata> list = (List<HasMetadata>)object;
            for(HasMetadata hasMetadata : list){
                System.out.println(hasMetadata);
            }
        }

        System.out.println("end : " + client.apps().deployments().list().getItems().size());


    }*/
}
