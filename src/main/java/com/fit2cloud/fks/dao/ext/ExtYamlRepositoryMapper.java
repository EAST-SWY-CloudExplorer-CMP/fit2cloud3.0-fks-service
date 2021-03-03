package com.fit2cloud.fks.dao.ext;

import com.fit2cloud.fks.dto.request.ListReposRequest;
import com.fit2cloud.fks.model.YamlRepository;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface ExtYamlRepositoryMapper {
    /**
     * 列举yaml仓库
     * @param listReposRequest
     * @return
     */
    List<YamlRepository> listRepository(ListReposRequest listReposRequest);

    /**
     * 根据名称和版本筛选
     * @param name
     * @param version
     * @return
     */
    List<YamlRepository> selectByNameAndVersion(@Param("name") String name, @Param("version") String version);

    /**
     * 根据名称和版本筛选
     * @param yamlRepository
     * @return
     */
    int updateByNameAndVersion(YamlRepository yamlRepository);
}