alter table yaml_repository add COLUMN `version` varchar(25) comment '版本' default '1.0' after `name`;
alter table yaml_repository modify COLUMN `yaml_content` longblob default null;
alter table yaml_repository modify COLUMN `id` varchar(50) default '0';
alter table yaml_repository drop primary key;
/*ALTER TABLE yaml_repository ADD PRIMARY KEY(`name`, `version`);*/