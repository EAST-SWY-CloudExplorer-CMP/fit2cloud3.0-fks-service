create table if not exists ko_settings (
  `id` int (11) not null auto_increment,
  `ko_address` varchar(100) not null comment 'ko地址',
  `ko_admin` varchar(100) not NULL comment '用户名',
  `admin_password` varchar(100) not NULL comment '密码',
  primary key(`id`)
) engine=InnoDB charset=utf8 collate=utf8_bin;