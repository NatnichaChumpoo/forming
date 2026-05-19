# ── Forming Monitor — Static file server ──────────────────────────────────────
# ห้ามปิด container นี้ด้วยตนเอง ยกเว้นจะปิดเครื่อง server จริงๆ
# (restart policy ถูกกำหนดใน docker-compose.yml ด้วย unless-stopped)
# ──────────────────────────────────────────────────────────────────────────────

FROM nginx:alpine

# Copy all app files into nginx web root
COPY . /usr/share/nginx/html

EXPOSE 80
