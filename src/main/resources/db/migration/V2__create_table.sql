create table if not exists yaml_repository (
  `id` int (11) not null auto_increment,
  `name` varchar(100) not null comment '仓库名称',
  `description` varchar(100) not NULL comment '用途描述',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP comment '创建时间',
  `yaml_content` varchar(5000) not null comment 'yaml文件',
  primary key(`id`)
) engine=InnoDB charset=utf8 collate=utf8_bin;