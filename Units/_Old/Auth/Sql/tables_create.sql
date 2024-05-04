-- create database `SkysmartSolver`;
-- use `SkysmartSolver`;


create table if not exists `Auth_tokens` (
  `date` datetime,
  `token` varchar (100),
  `user_id` int
);


create table if not exists `Auth_users` (
  `id` int auto_increment,
  `name` varchar (30),
  `password` varchar (50),
  
  primary key (`id`)
);
