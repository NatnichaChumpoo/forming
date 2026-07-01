# ── Forming Monitor — Static file server ──────────────────────────────────────
# ห้ามปิด container นี้ด้วยตนเอง ยกเว้นจะปิดเครื่อง server จริงๆ
# (restart policy ถูกกำหนดใน docker-compose.yml ด้วย unless-stopped)
# ──────────────────────────────────────────────────────────────────────────────

FROM nginx:alpine

# Copy all app files into nginx web root
COPY . /usr/share/nginx/html

# no-cache config so browsers pick up new code after deploy without a hard refresh
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
