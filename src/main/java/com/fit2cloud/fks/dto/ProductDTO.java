package com.fit2cloud.fks.dto;

import com.fit2cloud.commons.utils.BeanUtils;
import io.swagger.annotations.ApiModelProperty;

import java.util.ArrayList;
import java.util.List;

public class ProductDTO extends ProductWithBLOBs {
    @ApiModelProperty(hidden = true)
    private String pluginIcon;
    @ApiModelProperty("产品标签")
    private List<String> tags = new ArrayList<>();

    public String getPluginIcon() {
        return pluginIcon;
    }

    public void setPluginIcon(String pluginIcon) {
        this.pluginIcon = pluginIcon;
    }


    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public ProductDTO fromProducts(ProductWithBLOBs productWithBLOBs) {
        ProductDTO productDTO = new ProductDTO();
        BeanUtils.copyBean(productDTO, productWithBLOBs);
//        List<ProductTag> sfProductsTagList = CommonBeanFactory.getBean(VmExtProductMapper.class).getTagsOfProduct(productWithBLOBs.getId());
//        for (ProductTag sfProductsTag : sfProductsTagList) {
//            productDTO.getTags().add(sfProductsTag.getTagKey());
//        }
        return productDTO;
    }
}
