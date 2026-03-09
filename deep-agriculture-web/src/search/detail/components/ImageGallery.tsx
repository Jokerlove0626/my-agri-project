// src/search/detail/components/ImageGallery.tsx
"use client"; // <-- 标记为客户端组件，因为未来可能添加点击放大等交互

import React from 'react';
import Image from 'next/image'; // 使用 Next.js Image 组件优化图片加载
import styles from './ImageGallery.module.css';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  // type?: string; // 图片类型，如果需要可以加上
}

interface ImageGalleryProps {
  images: GalleryImage[];
}

/**
 * 相关图片展示廊组件
 */
const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {

  const handleImageClick = (src: string, alt: string) => {
    console.log(`Image clicked: ${alt} (${src})`);
    // TODO: 在这里实现点击图片放大/打开模态框的逻辑
    alert(`查看图片: ${alt}\n（功能待实现）`);
  };

  if (!images || images.length === 0) {
    return <p className={styles.noImages}>暂无相关图片</p>; // 没有图片时的提示
  }

  return (
    <div className={styles.imageGallery}>
      {images.map((img) => (
        <figure
          key={img.id}
          className={styles.galleryItem}
          onClick={() => handleImageClick(img.src, img.alt)} // 添加点击事件
        >
          {/* 使用 Next/Image 进行优化 */}
          <Image
            src={img.src}
            alt={img.alt}
            width={100} // 提供基础宽度和高度用于占位和计算比例
            height={80}
            className={styles.galleryImage}
            title={img.alt} // 添加悬停提示
            unoptimized={img.src.startsWith('http://')} // 如果是外部 URL 且无法优化，添加 unoptimized
            style={{ objectFit: 'cover' }} // 保持覆盖效果
          />
          <figcaption className={styles.galleryCaption}>{img.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
};

export default ImageGallery;