import React, { useState } from 'react';
import { Edit2, RefreshCw } from 'lucide-react';
import { Card, StatusBadge, Button, Modal, Textarea, Input } from '@/components/shared';
import type { Page } from '@/types';

interface DescriptionCardProps {
  page: Page;
  index: number;
  onUpdate: (data: Partial<Page>) => void;
  onRegenerate: () => void;
}

export const DescriptionCard: React.FC<DescriptionCardProps> = ({
  page,
  index,
  onUpdate,
  onRegenerate,
}) => {
  // 兼容后端返回的数据格式
  const descContent = page.description_content;
  const title = descContent?.title || '';
  const textContent = descContent?.text_content || [];
  const layoutSuggestion = descContent?.layout_suggestion || '';
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(
    Array.isArray(textContent) ? textContent.join('\n') : ''
  );
  const [editLayout, setEditLayout] = useState(layoutSuggestion);

  const handleEdit = () => {
    // 在打开编辑对话框时，从当前的 page 获取最新值
    const currentDescContent = page.description_content;
    const currentTitle = currentDescContent?.title || '';
    const currentTextContent = currentDescContent?.text_content || [];
    const currentLayoutSuggestion = currentDescContent?.layout_suggestion || '';
    
    setEditTitle(currentTitle);
    setEditContent(
      Array.isArray(currentTextContent) ? currentTextContent.join('\n') : ''
    );
    setEditLayout(currentLayoutSuggestion);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate({
      description_content: {
        title: editTitle,
        text_content: editContent.split('\n').filter((t) => t.trim()),
        layout_suggestion: editLayout,
      },
    });
    setIsEditing(false);
  };

  return (
    <>
      <Card className="p-0 overflow-hidden">
        {/* 标题栏 */}
        <div className="bg-banana-50 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">第 {index + 1} 页</span>
              {page.part && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  {page.part}
                </span>
              )}
            </div>
            <StatusBadge status={page.status} />
          </div>
        </div>

        {/* 内容 */}
        <div className="p-4">
          {page.description_content ? (
            <div className="space-y-3">
              {/* 如果有 title 字段 */}
              {descContent?.title && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">标题</div>
                  <div className="font-medium text-gray-900">
                    {descContent.title}
                  </div>
                </div>
              )}
              
              {/* 如果有 text_content 数组 */}
              {Array.isArray(descContent?.text_content) && descContent.text_content.length > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">内容</div>
                  <div className="space-y-1">
                    {descContent.text_content.map((text, idx) => (
                      <p key={idx} className="text-sm text-gray-700">
                        {text}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 如果只有 text 字段（后端返回格式） */}
              {(descContent as any)?.text && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">描述内容</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {(descContent as any).text}
                  </div>
                </div>
              )}
              
              {/* 如果有布局建议 */}
              {descContent?.layout_suggestion && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">布局建议</div>
                  <div className="text-sm text-gray-600">
                    {descContent.layout_suggestion}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm">尚未生成描述</p>
            </div>
          )}
        </div>

        {/* 操作栏 */}
        <div className="border-t border-gray-100 px-4 py-3 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit2 size={16} />}
            onClick={handleEdit}
            disabled={!page.description_content}
          >
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={16} />}
            onClick={onRegenerate}
          >
            重新生成
          </Button>
        </div>
      </Card>

      {/* 编辑对话框 */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="编辑页面描述"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="标题"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <Textarea
            label="内容（每行一段）"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={8}
          />
          <Input
            label="布局建议"
            value={editLayout}
            onChange={(e) => setEditLayout(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

