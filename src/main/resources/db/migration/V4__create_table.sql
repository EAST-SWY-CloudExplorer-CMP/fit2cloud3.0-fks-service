create table if not exists yaml_histrory (
  `id` int (11) not null auto_increment,
  `repo_id` int (11) not null comment '仓库id',
  `cluster_id` varchar(50) not null comment '集群id',
  `master_url` varchar(50) not null comment 'master地址',
  `token` varchar(2000) not null comment 'token',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP comment '创建时间',
  `yaml_file` longblob COMMENT 'yaml文件',
  `status` tinyint (1) not null comment '部署结果',
  `message` varchar(1000) not null comment '部署信息',
  primary key(`id`)
) engine=InnoDB charset=utf8 collate=utf8_bin;