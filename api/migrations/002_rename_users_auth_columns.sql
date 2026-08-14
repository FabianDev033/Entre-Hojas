RENAME TABLE `user` TO `users`;

ALTER TABLE `users`
  RENAME COLUMN `usuario` TO `user`,
  RENAME COLUMN `contraseña` TO `password`;
