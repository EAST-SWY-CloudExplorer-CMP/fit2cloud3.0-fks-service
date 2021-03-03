create table if not exists ko_clusters (
  `cluster_id` varchar(50) CHARACTER SET utf8mb4 NOT NULL COMMENT '集群id',
  `cluster_name` varchar(64) CHARACTER SET utf8mb4 NOT NULL DEFAULT '' COMMENT '集群名称',
  `version` varchar(50) CHARACTER SET utf8mb4 COMMENT '集群版本',
  `deploy_type` varchar(64) CHARACTER SET utf8mb4 COMMENT '部署模型',
  `nodes_num` varchar(50) CHARACTER SET utf8mb4 COMMENT '节点数',
  `status` varchar(64) CHARACTER SET utf8mb4 COMMENT '状态',
  `resource_type` varchar(64) CHARACTER SET utf8mb4 NOT NULL DEFAULT '存量接入' COMMENT '来源',
  primary key(`cluster_id`)
) engine=InnoDB charset=utf8 collate=utf8_bin;