package com.fit2cloud.fks.controller;

import com.fit2cloud.fks.common.constants.PermissionConstants;
import com.fit2cloud.fks.dto.ProductDTO;
import com.fit2cloud.fks.service.ProductService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("catalog-product")
@Api(tags = "浏览产品")
public class ClusterProductController {
    @Resource
    private ProductService productService;

    @GetMapping("list")
    @RequiresPermissions(PermissionConstants.CATALOG_PRODUCT_READ)
    @ApiOperation("产品列表")
    public List<ProductDTO> listProducts() {
        return productService.listCatalogProduct();
    }

//    @GetMapping("detail/{productId}")
//    @RequiresPermissions(PermissionConstants.CATALOG_PRODUCT_APPLY)
//    @ApiOperation("产品详情")
//    public ClusterProductWithBLOBs getCatalogProductDetail(@PathVariable String productId) {
//        return clusterProductService.getCatalogProductDetail(productId);
//    }
}
