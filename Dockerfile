# Dùng Node.js chính thức làm base image
FROM node:22-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy package.json và lock file
COPY package.json package-lock.json ./

# Cài đặt dependencies (bao gồm Prisma Client và Prisma CLI)
RUN npm install --production

# Copy thư mục dist (mã đã build)
COPY dist ./dist

# Copy file schema.prisma vào container (nếu chỉ có schema)
COPY prisma/schema.prisma ./prisma/schema.prisma

# Khai báo cổng sẽ sử dụng
EXPOSE 8000

# Sử dụng JSON array với shell làm entrypoint
CMD ["/bin/sh", "-c", "npx prisma generate && node dist/main.js"]
