-- 添加user_id字段到projects表
-- Migration: Add user_id field to projects table for multi-user support

ALTER TABLE projects ADD COLUMN user_id VARCHAR(36);

-- 创建索引以优化按用户查询
CREATE INDEX idx_projects_user_id ON projects(user_id);
