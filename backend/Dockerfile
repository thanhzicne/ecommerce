# Dùng JRE slim thay vì JDK đầy đủ → image nhỏ hơn ~300MB
FROM eclipse-temurin:17-jre-alpine

# Tạo thư mục /app bên trong container làm nơi làm việc
WORKDIR /app

# Copy file JAR từ máy local vào container, đổi tên thành app.jar
COPY target/*.jar app.jar

# Khai báo container sẽ lắng nghe port 8080 (chỉ là metadata)
EXPOSE 8080

# Biến môi trường để truyền JVM options từ ngoài vào nếu cần
ENV JAVA_OPTS=""

# Lệnh chạy khi container khởi động
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]