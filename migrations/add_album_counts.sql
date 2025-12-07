-- 为 n8n_albums 表添加图片和视频计数字段
-- 这样可以避免每次都进行文件系统操作，提升性能

ALTER TABLE n8n_albums 
ADD COLUMN image_count INT DEFAULT 0 COMMENT '图片数量' AFTER status,
ADD COLUMN video_count INT DEFAULT 0 COMMENT '视频数量' AFTER image_count;

-- 为新字段添加索引（可选，用于排序和筛选）
CREATE INDEX idx_image_count ON n8n_albums(image_count);
CREATE INDEX idx_video_count ON n8n_albums(video_count);
