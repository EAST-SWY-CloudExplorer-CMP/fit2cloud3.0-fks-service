create table if not exists clusters_auth (
  `cluster_id` varchar(50) CHARACTER SET utf8mb4 NOT NULL DEFAULT '' COMMENT '集群id',
  `cluster_name` varchar(64) CHARACTER SET utf8mb4 NOT NULL DEFAULT '' COMMENT '集群名称',
  `org_id` varchar(50) NOT NULL COMMENT '组织id',
  `org_name` varchar(64) NOT NULL COMMENT '组织名称',
  `workspace_id` varchar(50) CHARACTER SET utf8mb4 NOT NULL COMMENT '工作空间id',
  `workspace_name` varchar(64) CHARACTER SET utf8mb4 NOT NULL COMMENT '工作空间名称',
  primary key(`cluster_id`)
) engine=InnoDB charset=utf8 collate=utf8_bin;