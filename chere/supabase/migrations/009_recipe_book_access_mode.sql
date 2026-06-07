-- Chère: Recipe Book link access control
-- Migration: 009_recipe_book_access_mode

alter table creations
  add column if not exists access_mode text not null default 'invited'
    check (access_mode in ('invited', 'open_link'));
