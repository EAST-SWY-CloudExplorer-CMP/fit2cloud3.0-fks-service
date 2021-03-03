package com.fit2cloud.fks.dao;

import com.fit2cloud.fks.dto.KoClusterDTO;

import java.util.List;

public interface KoClusterMapper {
    List<KoClusterDTO> queryKoClusters();

    int saveKoClusters(KoClusterDTO koClusterDTO);
}
