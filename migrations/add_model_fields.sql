-- 为 n8n_album_models 表添加新字段
-- 模特别名、模特介绍、模特封面

ALTER TABLE n8n_album_models 
ADD COLUMN model_alias VARCHAR(255) NULL AFTER model_name,
ADD COLUMN model_intro TEXT NULL AFTER model_alias,
ADD COLUMN model_cover_url VARCHAR(500) NULL AFTER model_intro;
