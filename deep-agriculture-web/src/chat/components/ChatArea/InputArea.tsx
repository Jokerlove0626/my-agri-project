// src/chat/components/ChatArea/InputArea.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import FunctionToggles from './FunctionToggles';
import PreviewArea from './PreviewArea';
import Icon from '@/chat/components/common/Icon';
import type { FilePreview } from '@/chat/types';

// 定义 InputArea 组件 props 类型
interface InputAreaProps {
  onSendMessage: (text: string, files: File[]) => void; // 发送消息的回调
  isSending: boolean; // 是否正在发送消息 (用于禁用按钮)
}

/**
 * 页面底部的输入区域，包括功能切换、文件上传、输入框和发送按钮
 * @param onSendMessage - 当用户点击发送按钮或按 Enter 键时触发的回调
 * @param isSending - 指示当前是否正在发送消息（例如等待 AI 响应）
 */
const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isSending }) => {
  // --- State ---
  const [userInput, setUserInput] = useState(''); // 输入框文本内容
  const [activeToggles, setActiveToggles] = useState<Set<string>>(new Set()); // 激活的功能按钮
  const [previews, setPreviews] = useState<FilePreview[]>([]); // 文件预览列表
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // 实际上传的文件对象列表

  // --- Refs ---
  const textareaRef = useRef<HTMLTextAreaElement>(null); // 引用 textarea 元素
  const imageInputRef = useRef<HTMLInputElement>(null); // 引用隐藏的图片输入框
  const fileInputRef = useRef<HTMLInputElement>(null); // 引用隐藏的文件输入框

  // --- Effects ---
  // 自动调整 textarea 高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // 重置高度以获取 scrollHeight
      const maxHeight = 110; // CSS 中定义的最大高度
      const scrollHeight = textarea.scrollHeight;
      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto'; // 超出最大高度显示滚动条
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden'; // 未超出则隐藏滚动条
      }
    }
  }, [userInput]); // 当输入内容变化时触发

  // --- Handlers ---
  // 处理文本输入变化
  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(event.target.value);
  };

  // 处理功能按钮切换
  const handleToggle = (id: string) => {
    setActiveToggles((prevToggles) => {
      const newToggles = new Set(prevToggles);
      if (newToggles.has(id)) {
        newToggles.delete(id); // 如果已激活，则取消激活
      } else {
        // 可选：实现互斥逻辑，例如一次只能激活一个
        // newToggles.clear();
        newToggles.add(id); // 否则激活
      }
      console.log("Active toggles:", Array.from(newToggles)); // 打印当前激活的功能
      return newToggles;
    });
  };

  // 处理发送消息逻辑
  const sendMessage = useCallback(() => {
     const trimmedInput = userInput.trim();
    // 文本或文件至少有一个才能发送
    if ((trimmedInput || uploadedFiles.length > 0) && !isSending) {
      console.log("Sending message:", trimmedInput, "Files:", uploadedFiles);
      onSendMessage(trimmedInput, [...uploadedFiles]); // 传递文本和文件副本
      setUserInput(''); // 清空输入框
      setPreviews([]); // 清空预览
      setUploadedFiles([]); // 清空已上传文件列表
      // 可选：清空激活的功能按钮
      // setActiveToggles(new Set());
      // 强制重置 textarea 高度
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.overflowY = 'hidden';
      }
    }
  }, [userInput, uploadedFiles, isSending, onSendMessage]);


  // 处理键盘事件 (Enter 发送, Shift+Enter 换行)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // 阻止默认换行行为
      sendMessage();
    }
  };

  // 处理文件/图片选择
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];

            // 检查文件类型（如果是图片上传）
            if (type === 'image' && !file.type.startsWith('image/')) {
                alert('请选择图片文件！'); // 或者使用更友好的提示组件
                return;
            }

            const reader = new FileReader();
            const elementId = `preview-${Date.now()}-${Math.random()}`; // 创建唯一 ID

            reader.onload = (e) => {
                const newPreview: FilePreview = {
                    id: file.name + Date.now(), // 简单唯一ID
                    elementId: elementId,
                    type: type,
                    name: file.name,
                    url: e.target?.result as string, // Data URL
                    file: file, // 保存原始 File 对象
                };
                setPreviews((prev) => [...prev, newPreview]);
                setUploadedFiles((prev) => [...prev, file]); // 添加到待上传列表
            };

            reader.readAsDataURL(file);
        }
        // 重置 input value，允许用户再次选择相同文件
        event.target.value = '';
    };

  // 移除预览项
    const handleRemovePreview = (elementIdToRemove: string) => {
        setPreviews((prev) => prev.filter((p) => p.elementId !== elementIdToRemove));
        // 同时从待上传文件列表中移除对应的 File 对象
        setUploadedFiles((prevFiles) => {
            const previewToRemove = previews.find(p => p.elementId === elementIdToRemove);
            return prevFiles.filter(f => f !== previewToRemove?.file);
        });
    };


  return (
    <footer className="input-area-container">
      {/* 功能切换按钮 */}
      <FunctionToggles activeToggles={activeToggles} onToggle={handleToggle} />

      {/* 输入气泡 */}
      <div className="input-area">
        {/* 左侧操作按钮 */}
        <div className="input-buttons">
          <button onClick={() => imageInputRef.current?.click()} title="上传图片">
            <Icon name="Image" size={18} className="feather" />
          </button>
          <button onClick={() => fileInputRef.current?.click()} title="上传附件">
            <Icon name="Paperclip" size={18} className="feather" />
          </button>
          {/* 隐藏的文件输入框 */}
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'image')}
            className="hidden-file-input"
          />
          <input
            type="file"
            ref={fileInputRef}
            // accept=".pdf,.doc,.docx,.txt" // 根据需要限制文件类型
            onChange={(e) => handleFileChange(e, 'file')}
            className="hidden-file-input"
          />
        </div>

        {/* 输入内容区域（包含预览和文本框） */}
        <div className="input-content">
          <PreviewArea previews={previews} onRemovePreview={handleRemovePreview} />
          <textarea
            id="user-input"
            ref={textareaRef}
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题，Shift+Enter 换行"
            rows={1} // 初始行数
            disabled={isSending} // 正在发送时禁用
          />
        </div>

        {/* 发送按钮 */}
        <button
          id="send-button"
          title="发送"
          onClick={sendMessage}
          disabled={isSending || (!userInput.trim() && uploadedFiles.length === 0)} // 正在发送或无内容时禁用
        >
          <Icon name="Send" size={18} className="feather" />
        </button>
      </div>

      {/* 页脚免责声明 */}
      <div className="footer-notice">
        DeepForest 生成的内容由大型模型驱动，请谨慎甄别其准确性。
      </div>
    </footer>
  );
};

export default InputArea;