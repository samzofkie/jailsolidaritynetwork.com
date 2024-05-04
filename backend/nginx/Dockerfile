# docker build -t nginx-log-rotate .
FROM nginx
RUN apt-get update && apt-get -y install cron python3

RUN rm /var/log/nginx/access.log
RUN rm /var/log/nginx/error.log
COPY rotate-logs.py /root/
COPY nginx.conf mime.types cert.pem privkey.pem /etc/nginx/
COPY root /var/spool/cron/crontabs/root

CMD service cron start && nginx -g 'daemon off;'
