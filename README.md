### Setting Up the DMS Microservices Architecture

To get the microservices implementation working, you'll need to follow these steps:

## 1. Project Structure Setup

First, create the project structure as defined in the code:

```shellscript
mkdir -p dms-microservices/{dms-common,dms-gateway,dms-auth-service,dms-user-service,dms-document-service}
cd dms-microservices
```

## 2. Create Gradle Configuration Files

Create the root `settings.gradle` and `build.gradle` files in the root directory, then create the individual build files for each microservice as shown in the code.

## 3. Set Up Database

You have two options:

### Option A: Using Docker (Recommended)

1. Create the `docker-compose.yml` and `init-db.sql` files as provided in the code.
2. Start the PostgreSQL container:


```shellscript
docker-compose up -d postgres
```

### Option B: Manual Setup

1. Install PostgreSQL on your system if not already installed.
2. Create three databases:

1. `dms_auth`
2. `dms_user`
3. `dms_document`





## 4. Configure AWS S3

For document storage:

1. Create an AWS account if you don't have one.
2. Create an S3 bucket for document storage.
3. Create an IAM user with S3 access permissions.
4. Note down the access key, secret key, region, and bucket name.


## 5. Set Environment Variables

Create a `.env` file in the root directory with:

```plaintext
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
```

## 6. Build the Microservices

From the root directory:

```shellscript
./gradlew clean build
```

If you encounter permission issues with the gradlew script:

```shellscript
chmod +x gradlew
```

## 7. Start the Microservices

```shellscript
docker-compose up -d
```

This will start:

- Eureka Service Registry (on port 8761)
- API Gateway (on port 8080)
- Auth Service (on port 8081)
- User Service (on port 8082)
- Document Service (on port 8083)


## 8. Update the Frontend

1. Set the API URL environment variable in your Next.js project:


```plaintext
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

2. Update your frontend code with the API client files and Redux slices as provided.
3. Restart your Next.js development server:


```shellscript
npm run dev
```

## 9. Verify the Setup

1. Check if all services are running:

1. Open Eureka dashboard at [http://localhost:8761](http://localhost:8761)
2. All services should be registered



2. Test the authentication:

1. Try logging in with the admin credentials
2. The system should now authenticate against the Auth Service





## Troubleshooting

If you encounter issues:

1. **Services not starting**: Check the logs with `docker-compose logs [service-name]`
2. **Database connection issues**: Verify PostgreSQL is running and accessible:

```shellscript
docker-compose exec postgres psql -U postgres -c "\l"
```


3. **API Gateway not routing**: Check if Eureka has all services registered
4. **S3 connection issues**: Verify your AWS credentials and permissions


## Development Workflow

When making changes:

1. Update the code in the respective microservice
2. Rebuild: `./gradlew :dms-service-name:build`
3. Restart the service: `docker-compose restart service-name`


Would you like me to explain any specific part of the implementation in more detail?
