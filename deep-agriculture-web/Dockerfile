# Dockerfile for DeepForest Next.js Frontend

# --- Stage 1: Build ---
# 使用官方 Node.js 18 Alpine 镜像作为构建环境
# Alpine 镜像体积更小，但有时可能缺少某些依赖
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm (如果基础镜像不包含，需要取消注释下一行)
RUN npm install -g pnpm

# 优化层缓存：先复制依赖描述文件
COPY package.json pnpm-lock.yaml ./

# 安装所有依赖项（包括 devDependencies，因为构建过程需要它们）
# 使用 --frozen-lockfile 确保使用 lock 文件中的精确版本
RUN pnpm install --frozen-lockfile

# 复制项目所有源代码和配置文件到工作目录
# 确保 .dockerignore 文件没有排除 tsconfig.json, next.config.mjs, tailwind.config.js, postcss.config.mjs 等构建所需文件
COPY . .

# 设置环境变量 (如果需要)
# 例如: ARG NEXT_PUBLIC_API_BASE_URL
# ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NODE_ENV=production

# 执行 Next.js 生产构建
# 这会编译代码、优化资源并生成 .next 目录
RUN pnpm build

# (可选优化: 移除开发依赖以减小复制到下一阶段的大小)
# 如果最终镜像体积过大，可以取消注释下一行
# RUN pnpm prune --prod


# --- Stage 2: Production ---
# 使用相同的 Node.js 18 Alpine 镜像作为最终运行环境
# 保持基础镜像一致性有助于减少潜在问题
FROM node:18-alpine AS runner

# 设置工作目录
WORKDIR /app

# 设置生产环境变量 (再次确保)
ENV NODE_ENV=production
# 如果你的 Next.js 应用需要监听所有网络接口 (常见于 Docker 环境)
# 可以取消注释下一行，或者在 `next start` 时通过 -H 0.0.0.0 指定
# ENV HOSTNAME "0.0.0.0"

# 从构建阶段复制必要的产物

# 复制生产依赖项
# 如果在 builder 阶段执行了 `pnpm prune --prod`，这里复制的就是纯生产依赖
COPY --from=builder /app/node_modules ./node_modules

# 复制 Next.js 构建输出 (.next 目录)
# 这是运行生产服务器的核心
COPY --from=builder /app/.next ./.next

# 复制 public 目录下的静态资源
COPY --from=builder /app/public ./public

# 复制 package.json (next start 需要读取配置，例如端口等)
COPY --from=builder /app/package.json ./package.json

# (如果 start 脚本或运行时依赖 pnpm，则需要复制 pnpm-lock.yaml 并可能在 runner 中安装 pnpm)
# 通常直接用 node 启动不需要

# 暴露容器将监听的端口 (Next.js 默认 3000)
EXPOSE 3000

# 设置用户（可选但更安全）
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
# USER nextjs

# 启动 Next.js 生产服务器
# 使用 Node.js 直接执行 Next.js 的启动脚本，避免 shell 解析问题
CMD ["node", "node_modules/next/dist/bin/next", "start"]

# 如果需要指定主机名或端口，可以通过 CMD 参数传递
# 例如: CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]