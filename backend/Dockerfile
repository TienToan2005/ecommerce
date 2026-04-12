# Dùng image JDK 21
FROM eclipse-temurin:21-jdk-alpine

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file jar sau khi build vào container
COPY target/*.jar app.jar

# Mở cổng 8080
EXPOSE 8080

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]