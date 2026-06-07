-- Chère: Recipe Book tribute banner
-- Migration: 008_recipe_book_banner

alter table creations
  add column if not exists banner_header text,
  add column if not exists banner_subheader text;
