create table if not exists ko_specs (
  `specs_id` varchar(64) CHARACTER SET utf8mb4 NOT NULL COMMENT '规格编号',
  `specs_name` varchar(64) CHARACTER SET utf8mb4 NOT NULL DEFAULT '' COMMENT '规格名称',
  `node_num` varchar(64) CHARACTER SET utf8mb4 NOT NULL DEFAULT '0' COMMENT '节点数量',
  `zone` varchar(64) CHARACTER SET utf8mb4 NOT NULL DEFAULT '' COMMENT '可用区',
  `deploy_type` varchar(64) CHARACTER SET utf8mb4 COMMENT '部署模型',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP comment '创建时间',
  primary key(`specs_id`)
) engine=InnoDB charset=utf8 collate=utf8_bin;