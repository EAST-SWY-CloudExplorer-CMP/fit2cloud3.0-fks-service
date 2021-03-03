package com.fit2cloud.fks.dao;

import com.fit2cloud.fks.dto.SpecsDTO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface KoSpecsMapper {
    int saveKoSpecs(SpecsDTO specsDTO);

    List<SpecsDTO> queryKoSpecsList();

    int deleteKoSpecs(@Param("specsId") String specsId);
}
