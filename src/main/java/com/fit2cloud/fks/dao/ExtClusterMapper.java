package com.fit2cloud.fks.dao;

import com.fit2cloud.fks.dto.ClusterDTO;
import com.fit2cloud.fks.dto.DashboardClusterDTO;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

public interface ExtClusterMapper {
    List<ClusterDTO> topoClusters(Map<String, Object> param);

    List<DashboardClusterDTO> getDashboardClusters(Map<String, Object> param);

    int saveAuthClusters(DashboardClusterDTO dashboardClusterDTO);

    DashboardClusterDTO queryAuthClusters(@Param("clusterId") String clusterId);

    int deleteAuthClusters(@Param("clusterId") String clusterId);
}
