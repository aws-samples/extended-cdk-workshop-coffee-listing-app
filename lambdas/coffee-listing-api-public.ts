import * as AWS from "aws-sdk";
import * as crypto from "crypto";
import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from "aws-lambda";

let response: APIGatewayProxyStructuredResultV2 = {
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
};

export async function handler(event: APIGatewayProxyEvent): Promise<typeof response> {
  if (event.resource === "/images") {
    if (event.httpMethod === "GET") {
      return getAllS3Items();
    }
    if (event.httpMethod === "POST") {
      return postCreateS3PresignedPostUrl(event);
    }
  }
  console.log(JSON.stringify(event, null, 2));
  response.statusCode = 404;
  response.body = JSON.stringify({ ok: false, payload: "Route not found" });
  return response;
}

let { BUCKET_NAME = "", BUCKER_UPLOAD_FOLDER_NAME = "" } = process.env;
let s3 = new AWS.S3();
let bucketParams = {
  Bucket: BUCKET_NAME,
  Prefix: BUCKER_UPLOAD_FOLDER_NAME,
};
async function getAllS3Items() {
  let s3List = await s3.listObjects(bucketParams).promise();
  let s3Contents: AWS.S3.ObjectList = s3List.Contents || [];
  let images = s3Contents
    .sort((a, b) => {
      let dateA = a.LastModified as Date;
      let dateB = b.LastModified as Date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .map((item) => {
      let { Key = "" } = item;
      return { id: Key.split(".")[0], url: Key };
    });
  response.statusCode = 200;
  response.body = JSON.stringify(images);
  return response;
}

async function postCreateS3PresignedPostUrl(event: APIGatewayProxyEvent) {
  let body = JSON.parse(event.body as string);
  let id = crypto.randomBytes(16).toString("hex");
  let presignedPostUrl = s3.createPresignedPost({
    Bucket: BUCKET_NAME,
    Fields: {
      key: `${BUCKER_UPLOAD_FOLDER_NAME}/${id}.${body.fileName.split(".").pop()}`,
    },
  });
  response.statusCode = 200;
  response.body = JSON.stringify(presignedPostUrl);
  return response;
}
