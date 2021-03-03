package com.fit2cloud.fks.controller;

import com.fit2cloud.commons.utils.PageUtils;
import com.fit2cloud.commons.utils.Pager;
import com.fit2cloud.fks.dto.request.ListReposRequest;
import com.fit2cloud.fks.model.YamlHistrory;
import com.fit2cloud.fks.model.YamlRepository;
import com.fit2cloud.fks.service.KoService;
import com.fit2cloud.fks.service.YamlService;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@Api(tags = "api4yaml")
@RequestMapping("/yaml")
@RestController
public class YamlController {
    @Resource
    private YamlService yamlService;

    @Resource
    private KoService koService;

//    @ApiOperation("yaml仓库")
//    @GetMapping("/repository")
//    public List<YamlRepository> repository() throws Exception{
//        return yamlService.getRepository();
//    }

    @ApiOperation("yaml仓库")
    @PostMapping("/repository/{goPage}/{pageSize}")
    public Pager<List<YamlRepository>> repository(@PathVariable int goPage, @PathVariable int pageSize, @RequestBody ListReposRequest listReposRequest) throws Exception{
        Page page = PageHelper.startPage(goPage, pageSize, true);
        return PageUtils.setPageInfo(page, yamlService.listRepository(listReposRequest));
    }

    @ApiOperation("yaml部署结果")
    @GetMapping("/history")
    public List<YamlHistrory> history() throws Exception{
        return yamlService.getHistory();
    }

    @ApiOperation("yaml编辑")
    @PostMapping("/yamlEdit")
    public void yamlEdit(@RequestBody YamlRepository yamlRepository) throws Exception{
        yamlService.yamlEdit(yamlRepository);
    }

    @ApiOperation("yaml新建")
    @GetMapping("/yamlCreate")
    public Integer yamlCreate() throws Exception{
        return yamlService.yamlCreate();
    }

    @ApiOperation("yaml删除")
    @PostMapping("/yamlDelete")
    public void yamlDelete(@RequestBody Integer id) throws Exception{
        yamlService.yamlDelete(id);
    }

    @ApiOperation("yaml部署")
    @PostMapping("/yamlDeploy")
    public Boolean yamlDeploy(@RequestBody List<YamlRepository> yamlRepositorys) throws Exception{
        return yamlService.yamlDeploy(yamlRepositorys);
    }

    @ApiOperation("获取businessKey")
    @PostMapping("/businessKey")
    public Integer getBusinessKey() throws Exception{
        return yamlService.getBusinessKey();
    }

}
