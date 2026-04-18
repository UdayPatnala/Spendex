# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
# Copy only the backend folder content to /app
COPY backend /app
WORKDIR /app
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
COPY --from=build /app/target/*.jar /app/app.jar
WORKDIR /app
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
