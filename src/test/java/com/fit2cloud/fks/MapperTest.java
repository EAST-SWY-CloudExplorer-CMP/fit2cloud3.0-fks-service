package com.fit2cloud.fks;

import com.fit2cloud.fks.dao.YamlRepositoryMapper;
import com.fit2cloud.fks.model.YamlRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import javax.annotation.Resource;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MapperTest {


    @Resource
    private YamlRepositoryMapper yamlRepositoryMapper;

    @Test
    public void testInsert(){
        YamlRepository yamlRepository = new YamlRepository();
        yamlRepository.setName("test1111");
        yamlRepository.setDescription("test1111");
//        yamlRepository.setYamlContent("test");

        yamlRepositoryMapper.insertSelective(yamlRepository);

        System.out.println("id: " + yamlRepository.getId());

    }
}
