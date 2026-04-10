update public.users
set role = case
    when lower(role) = 'admin' then 'admin'
    else 'client'
end;

drop table if exists public.user_roles;
