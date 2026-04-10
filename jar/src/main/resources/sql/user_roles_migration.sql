create table if not exists user_roles (
    user_id bigint not null references users(id) on delete cascade,
    role varchar(20) not null,
    primary key (user_id, role)
);

insert into user_roles (user_id, role)
select u.id, upper(u.role)
from users u
where u.role is not null
on conflict (user_id, role) do nothing;
