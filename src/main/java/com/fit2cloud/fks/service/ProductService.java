package com.fit2cloud.fks.service;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.fit2cloud.commons.server.base.domain.CloudServerExample;
import com.fit2cloud.commons.server.base.domain.PluginWithBLOBs;
import com.fit2cloud.commons.server.base.mapper.CloudServerMapper;
import com.fit2cloud.commons.server.base.mapper.PluginMapper;
import com.fit2cloud.commons.server.constants.ResourceOperation;
import com.fit2cloud.commons.server.constants.RoleConstants;
import com.fit2cloud.commons.server.exception.F2CException;
import com.fit2cloud.commons.server.service.OperationLogService;
import com.fit2cloud.commons.server.utils.SessionUtils;
import com.fit2cloud.commons.utils.UUIDUtil;
import com.fit2cloud.fks.dto.ProductDTO;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(rollbackFor = Exception.class)
public class ProductService {
    /*@Resource
    private ProductTagMapper productTagMapper;
    @Resource
    private ProductTagMappingMapper productTagMappingMapper;
    @Resource
    private ProductMapper productMapper;
    @Resource
    private PluginService pluginService;
    @Resource
    private ProductPermissionMapper productPermissionMapper;
    @Resource
    private VmCloudServerMapper vmCloudServerMapper;
    @Resource
    private PluginMapper pluginMapper;
    @Resource
    private ProductGroupService productGroupService;
    @Resource
    private VmExtProductMapper vmExtProductMapper;
    @Resource
    private ExtResourcePoolTagMapper extResourcePoolTagMapper;
    @Resource
    private ResourcePoolTagService resourcePoolTagService;
    @Resource
    private CloudServerMapper cloudServerMapper;
    @Resource
    private ExtResourcePoolMapper extResourcePoolMapper;

    // EAST #Dxgl012001
    @Resource
    private ResourcePoolExtendAttrMapper resourcePoolExtendAttrMapper;
    // EAST

    @Resource
    private ExtResourcePoolService extResourcePoolService;*/

    public List<ProductDTO> listCatalogProduct() {
        /*List<ProductDTO> products = listAllWithTag();
        if (CollectionUtils.isEmpty(products)) {
            return Collections.emptyList();
        }

        String workspaceId = SessionUtils.getWorkspaceId();
        String organizationId = SessionUtils.getOrganizationId();

        List<ProductGroupDTO> relateProductGroups = productGroupService.getRelateProductGroups(workspaceId, organizationId);

        Set<String> productIds = new HashSet<>();

        Map<String, List<ProductGroupDTO>> map = relateProductGroups.parallelStream()
                .collect(Collectors.groupingBy(ProductGroupDTO::getPermissionMode));
        map.getOrDefault(ProductGroupPermissionMode.WHITELIST.name(), new ArrayList<>()).forEach(productGroupDTO -> productIds.addAll(productGroupDTO.getProductIds()));
        map.getOrDefault(ProductGroupPermissionMode.BLACKLIST.name(), new ArrayList<>()).forEach(productGroupDTO -> productIds.removeAll(productGroupDTO.getProductIds()));
        mergeProductGroup(productIds, workspaceId, organizationId);

        return setPluginIcon(products.stream()
                .filter(product -> productIds.contains(product.getId()))
                .collect(Collectors.toList()));*/
        return null;
    }

    /*public List<Product> listAll() {
        ProductExample productExample = new ProductExample();
        productExample.createCriteria().andStatusEqualTo(ProductConstants.Status.ENABLED.name());
        return productMapper.selectByExample(productExample);
    }

    public List<ProductDTO> listAllWithTag() {
        return vmExtProductMapper.listAllWithTag();
    }

    public List<ProductDTO> listProducts(Product product) {
        List<ProductDTO> result = new ArrayList<>();
        ProductExample example = new ProductExample();
        ProductExample.Criteria criteria = example.createCriteria();
        if (StringUtils.isNotBlank(product.getName())) {
            criteria.andNameLike("%" + product.getName() + "%");
        }
        if (StringUtils.isNotBlank(product.getPlatform())) {
            criteria.andPlatformEqualTo(product.getPlatform());
        }
        if (StringUtils.isNotBlank(product.getStatus())) {
            criteria.andStatusEqualTo(product.getStatus());
        }

        criteria.andStatusNotEqualTo(ProductConstants.Status.DELETED.name());
        example.setOrderByClause("publish_time desc");
        List<ProductWithBLOBs> productWithBLOBsList = productMapper.selectByExampleWithBLOBs(example);
        List<PluginWithBLOBs> plugins = pluginMapper.selectByExampleWithBLOBs(null);
        Map<String, String> pluginMap = plugins.stream().collect(Collectors.toMap(PluginWithBLOBs::getName, PluginWithBLOBs::getIcon));
        for (ProductWithBLOBs productWithBLOBs : productWithBLOBsList) {
            ProductDTO productDTO = new ProductDTO().fromProducts(productWithBLOBs);
            productDTO.setPluginIcon(pluginMap.get(productDTO.getPlatform()));
            result.add(productDTO);
        }
        return result;
    }

    public ProductWithBLOBs getCatalogProductDetail(String productId) {
        ProductWithBLOBs product = productMapper.selectByPrimaryKey(productId);
        if (product == null) {
            F2CException.throwException("未找到产品:" + productId);
        }

        List<ResourcePoolTag> resourcePoolTagByPlatform = null;
        if (SessionUtils.getUser() != null) {
            if (RoleConstants.Id.ADMIN.name().equals(SessionUtils.getUser().getParentRoleId())) {
                resourcePoolTagByPlatform = extResourcePoolTagMapper.getResourcePoolTagByPlatform(product.getPlatform());
            } else {
                List<ResourcePoolDTO> resourcePoolDTOS = extResourcePoolMapper.selectResourcePoolByPlatformWithPermission(product.getPlatform());
                String organizationId = SessionUtils.getUser().getOrganizationId();
                String workspaceId = SessionUtils.getUser().getWorkspaceId();

                //根据黑白名单过滤资源池
                resourcePoolDTOS = extResourcePoolService.filterResourcePoolWithPermissionMode(resourcePoolDTOS,organizationId,workspaceId);

                // EAST #Dxgl012001
                resourcePoolDTOS = ExtResourcePoolService.filterEnableResourcePools(resourcePoolExtendAttrMapper, resourcePoolDTOS);
                // EAST

                if (!CollectionUtils.isEmpty(resourcePoolDTOS)) {
                    resourcePoolTagByPlatform = new ArrayList<>(extResourcePoolTagMapper
                            .getResourcePoolTagByPlatformAndId(resourcePoolDTOS
                                    .stream()
                                    .map(ResourcePool::getId)
                                    .collect(Collectors.toList()), product.getPlatform()));
                }
            }
        } else {
            F2CException.throwException("无法从session中获取当前用户");
        }
        if (CollectionUtils.isEmpty(resourcePoolTagByPlatform)) {
            F2CException.throwException("当前产品关联的资源池标签为空，请确认是否定义了当前产品所属云平台的资源池, 或者当前用户是否具有使用当前产品所属云平台的资源池使用权限");
        }

        Map<String, ResourcePoolTag> resourcePoolTagMap = resourcePoolTagService.maps();
        Map<String, JSONObject> addedResourceTag = new HashMap<>();
        JSONArray launchConfiguration = JSONObject.parseArray(product.getLaunchConfiguration());
        //资源池标签只有两层，所以这里直接以resourcePoolTag.getParent()作为第一层的key
        resourcePoolTagByPlatform.forEach(resourcePoolTag -> {
            if (!addedResourceTag.containsKey(resourcePoolTag.getParent()) && resourcePoolTagMap.containsKey(resourcePoolTag.getParent())) {
                ResourcePoolTag parentResourcePoolTag = resourcePoolTagMap.get(resourcePoolTag.getParent());
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("resourcePoolTag", true);
                jsonObject.put("label", parentResourcePoolTag.getTagValue());
                jsonObject.put("name", "resource_pool_tag_" + parentResourcePoolTag.getId());
                jsonObject.put("inputType", "combobox");
                jsonObject.put("required", true);
                jsonObject.put("textField", "value");
                jsonObject.put("valueField", "key");
                jsonObject.put("role", "user");
                jsonObject.put("_index", Optional.ofNullable(parentResourcePoolTag.getIndex()).orElse(0));
                jsonObject.put("optionList", new JSONArray() {{
                    add(new JSONObject() {{
                        put("key", resourcePoolTag.getId());
                        put("value", resourcePoolTag.getTagValue());
                    }});
                }});
                addedResourceTag.put(resourcePoolTag.getParent(), jsonObject);
            } else if (resourcePoolTagMap.containsKey(resourcePoolTag.getParent())) {
                addedResourceTag.get(resourcePoolTag.getParent()).getJSONArray("optionList").add(new JSONObject() {{
                    put("key", resourcePoolTag.getId());
                    put("value", resourcePoolTag.getTagValue());
                }});
            }
        });

        if (addedResourceTag.size() == 0) {
            F2CException.throwException("添加资源池属性失败，未找到需要添加的资源池属性");
        }

        //一级标签按顺序插入launchConfiguration
        addedResourceTag.values().stream()
                .sorted(Comparator.comparingInt(jsonObject2 -> jsonObject2.getInteger("_index")))
                .forEach(jsonObject -> launchConfiguration.add(0, jsonObject));

        //stream只能消费一次，所以这里只能重新开始操作一次流，下面清空除了第一个资源池标签的optionList，optionList在页面上每次选择一个资源池标签后请求后台获取
        addedResourceTag.values().stream()
                .sorted(Comparator.comparingInt(jsonObject2 -> jsonObject2.getInteger("_index")))
                .limit(addedResourceTag.size() - 1).forEach(jsonObject -> jsonObject.put("optionList", null));

        product.setLaunchConfiguration(removeAdminProperty(launchConfiguration).toJSONString());
        return product;
    }

    public String addAdminProperty(String productId, String launchConfiguration) {
        if (StringUtils.isEmpty(launchConfiguration)) {
            return launchConfiguration;
        }

        ProductWithBLOBs productWithBLOBs = getProductById(productId);
        if (productWithBLOBs == null) {
            F2CException.throwException("未找到产品:" + productId);
        }

        if (StringUtils.isEmpty(productWithBLOBs.getLaunchConfiguration())) {
            return launchConfiguration;
        }

        JSONArray jsonArray = JSON.parseArray(launchConfiguration);
        JSONArray productJsonArray = JSON.parseArray(productWithBLOBs.getLaunchConfiguration());

        //获取用户参数，name -> value
        Map<String, JSONObject> userValueMap = new HashMap<>();
        //获取用户参数，name -> index
        Map<String, Integer> userValueIndexMap = new HashMap<>();
        for (int i = 0, j = jsonArray.size(); i < j; i++) {
            JSONObject jsonObject = jsonArray.getJSONObject(i);
            String name = jsonObject.getString("name");
            if (!StringUtils.isEmpty(name)) {
                userValueMap.put(name, jsonObject);
                userValueIndexMap.put(name, i);
            }
        }

        //用户参数覆盖产品属性
        for (int i = 0, j = productJsonArray.size(); i < j; i++) {
            JSONObject jsonObject = productJsonArray.getJSONObject(i);
            String name = jsonObject.getString("name");
            if (!StringUtils.isEmpty(name) && userValueMap.containsKey(name)) {
                if ("user".equalsIgnoreCase((jsonObject.getString("role")))) {
                    jsonObject.put("value", userValueMap.get(name).get("value"));
                    jsonObject.put("optionList", userValueMap.get(name).get("optionList"));
                }
                userValueMap.remove(name);
                userValueIndexMap.remove(name);
            }
        }

        userValueIndexMap.entrySet()
                .stream()
                .sorted(Comparator.comparingInt(Map.Entry::getValue))
                .forEach(entry -> productJsonArray.add(entry.getValue(), userValueMap.get(entry.getKey())));

        return productJsonArray.toJSONString();
    }

    public JSONArray removeAdminProperty(JSONArray launchConfiguration) {
        JSONArray jsonArray = new JSONArray();
        if (launchConfiguration != null && launchConfiguration.size() > 0) {
            for (int i = 0, j = launchConfiguration.size(); i < j; i++) {
                JSONObject item = launchConfiguration.getJSONObject(i);
                if ("user".equalsIgnoreCase(item.getString("role"))) {
                    if (null != item.get("name") && "instanceType" .equalsIgnoreCase(item.get("name").toString())) {
                        for (Map.Entry entry : item.entrySet()) {
                            if (entry.getKey().equals("optionList")) {
                                JSONArray object = (JSONArray) entry.getValue();
                                entry.setValue(object.stream().sorted(Comparator.comparingInt(obj -> (Integer) ((JSONObject) obj).get("cpu")))
                                        .collect(Collectors.toList()));
                            }
                        }
                    }
                    jsonArray.add(item);
                }
            }
        }
        return jsonArray;
    }

    public List<ProductTag> getProductTags() {
        ProductTagExample tagExample = new ProductTagExample();
        tagExample.setOrderByClause("_index");
        return productTagMapper.selectByExample(tagExample);
    }

    public ProductTag saveProductTag(ProductTag productTag) {
        if (StringUtils.isNotBlank(productTag.getTagKey())) {
            productTagMapper.updateByPrimaryKeySelective(productTag);
            return productTagMapper.selectByPrimaryKey(productTag.getTagKey());
        } else {
            productTag.setTagKey(UUIDUtil.newUUID());
            productTagMapper.insert(productTag);
            return productTag;
        }
    }

    public int deleteProductTag(String tagkey, String productId) {
        int result = 0;
        if (StringUtils.isNotBlank(tagkey)) {
            result = productTagMapper.deleteByPrimaryKey(tagkey);
            ProductTagExample productTagExample = new ProductTagExample();
            productTagExample.createCriteria().andTagKeyEqualTo(tagkey);
            productTagMapper.deleteByExample(productTagExample);
        }
        if (StringUtils.isNotBlank(productId)) {
            ProductTagMappingExample productTagMappingExample = new ProductTagMappingExample();
            productTagMappingExample.createCriteria().andProductIdEqualTo(productId);
            productTagMappingMapper.deleteByExample(productTagMappingExample);
        }
        return result;
    }

    public void deleteProduct(String productId) throws Exception {
        VmCloudServerExample vmCloudServerExample = new VmCloudServerExample();
        VmCloudServerExample.Criteria sfServerExampleCriteria = vmCloudServerExample.createCriteria();
        sfServerExampleCriteria.andProductIdEqualTo(productId);
        List<VmCloudServer> vmCloudServers = vmCloudServerMapper.selectByExample(vmCloudServerExample);
        if (CollectionUtils.isNotEmpty(vmCloudServers)) {
            CloudServerExample cloudServerExample = new CloudServerExample();
            cloudServerExample.createCriteria()
                    .andIdIn(vmCloudServers.stream().map(VmCloudServer::getCloudServerId).collect(Collectors.toList()))
                    .andInstanceStatusNotEqualTo(ServerConstants.Status.Deleted.toString());

            long count = cloudServerMapper.countByExample(cloudServerExample);
            if (count > 0) {
                throw new Exception("此产品尚有虚拟机在运行，不允许删除。如不再需要此产品请下架。");
            }
        }
        Product product = productMapper.selectByPrimaryKey(productId);
        if (product != null) {
            OperationLogService.log(null, product.getId(), product.getName(), "VM_PRODUCT", ResourceOperation.DELETE, null);
        }
        updateProductStatus(productId, ProductConstants.Status.DELETED.toString());
        ProductPermissionExample example = new ProductPermissionExample();
        example.createCriteria().andProductIdEqualTo(productId);
        productPermissionMapper.deleteByExample(example);
        deleteProductTag(null, productId);
    }

    public void saveProduct(ProductWithBLOBs productWithBLOBs) {
        ProductExample example = new ProductExample();
        example.createCriteria().andIdEqualTo(productWithBLOBs.getId());
        if (StringUtils.isNotBlank(productWithBLOBs.getLaunchConfiguration())) {
            productWithBLOBs.setLaunchConfiguration(pluginService.doSomethingBeforeSaveProduct(productWithBLOBs.getLaunchConfiguration()));
        }
        List<ProductWithBLOBs> sfProductsList = productMapper.selectByExampleWithBLOBs(example);
        if (!CollectionUtils.isEmpty(sfProductsList)) {
            OperationLogService.log(null, productWithBLOBs.getId(), productWithBLOBs.getName(), "VM_PRODUCT", ResourceOperation.UPDATE, null);
            productMapper.updateByExampleSelective(productWithBLOBs, example);
        } else {
            OperationLogService.log(null, productWithBLOBs.getId(), productWithBLOBs.getName(), "VM_PRODUCT", ResourceOperation.CREATE, null);
            productWithBLOBs.setPublishTime(System.currentTimeMillis());
            productWithBLOBs.setStatus(ProductConstants.Status.ENABLED.toString());
            productMapper.insert(productWithBLOBs);
        }
    }

    public void saveProductTagMapping(String productId, String[] tagKeys) {
        deleteProductTag(null, productId);
        if (tagKeys == null || tagKeys.length < 1) {
            return;
        }
        for (String tagKey : tagKeys) {
            ProductTagMapping sfProductsTagMapping = new ProductTagMapping();
            sfProductsTagMapping.setProductId(productId);
            sfProductsTagMapping.setTagKey(tagKey);
            productTagMappingMapper.insert(sfProductsTagMapping);
        }
    }

    public ProductWithBLOBs getProductById(String id) {
        return productMapper.selectByPrimaryKey(id);
    }

    public void updateProductStatus(String productId, String status) {
        ProductWithBLOBs sfProductsWithBLOBs = new ProductWithBLOBs();
        sfProductsWithBLOBs.setId(productId);
        sfProductsWithBLOBs.setStatus(status);
        productMapper.updateByPrimaryKeySelective(sfProductsWithBLOBs);
    }

    private void mergeProductGroup(Set<String> productIds, String workspaceId, String organizationId) {
        List<ProductGroupDTO> productGroups = productGroupService.getUnRelateProductGroups(workspaceId, organizationId);
        if (CollectionUtils.isEmpty(productGroups)) {
            return;
        }

        Map<String, List<ProductGroupDTO>> map = productGroups.parallelStream()
                .collect(Collectors.groupingBy(ProductGroupDTO::getPermissionMode));
        map.getOrDefault(ProductGroupPermissionMode.BLACKLIST.name(), new ArrayList<>()).forEach(productGroupDTO -> productIds.addAll(productGroupDTO.getProductIds()));
    }

    private List<ProductDTO> setPluginIcon(List<ProductDTO> products) {
        List<PluginWithBLOBs> plugins = pluginMapper.selectByExampleWithBLOBs(null);

        Map<String, String> pluginMap = new HashMap<>();
        plugins.forEach(plugin -> pluginMap.put(plugin.getName(), plugin.getIcon()));

        return products
                .stream()
                .peek(product -> product.setPluginIcon(pluginMap.get(product.getPlatform())))
                .collect(Collectors.toList());
    }

    private List<Product> getProductByName(String name) {
        ProductExample productExample = new ProductExample();
        productExample.createCriteria().andNameEqualTo(name).andStatusNotEqualTo(ProductConstants.Status.DELETED.toString());
        return productMapper.selectByExample(productExample);
    }

    public Product addOrEditProduct(String productsStr) {
        JSONObject json = JSON.parseObject(productsStr);

        if (StringUtils.isEmpty(json.getString("name"))) {
            F2CException.throwException("创建产品失败，产品名称为空");
        }

        if (StringUtils.isEmpty(json.getString("id"))) {
            if (!CollectionUtils.isEmpty(getProductByName(json.getString("name")))) {
                F2CException.throwException("已存在产品:" + json.getString("name"));
            }
        }

        String id = StringUtils.isNotBlank(json.getString("id")) ? json.getString("id") : UUIDUtil.newUUID();
        ProductWithBLOBs product = new ProductWithBLOBs();
        product.setId(id);
        product.setName(json.getString("name"));
        product.setDescription(json.getString("description"));
        product.setIconUrl(json.getString("iconUrl"));
        product.setPlatform(json.getString("platform"));
        product.setLaunchConfiguration(json.getString("launchConfiguration"));
        product.setExtendData(json.getString("extendData"));
        saveProduct(product);
        if (json.get("tags") != null) {
            List<String> tags = JSONObject.parseArray(json.getString("tags"), String.class);
            saveProductTagMapping(id, tags.toArray(new String[0]));
        }
        return product;
    }*/
}
