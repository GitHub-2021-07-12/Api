create table if not exists main.tokens (
  token text,
  user_id int,
  
  unique (token, user_id)
);
