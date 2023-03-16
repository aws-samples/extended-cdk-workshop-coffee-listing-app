import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

interface RestApiStackProps extends cdk.StackProps {
  bucket: s3.Bucket;
  distribution: cloudfront.Distribution;
}

export class RestApiStack extends cdk.Stack {
  public readonly restApi: apigateway.LambdaRestApi;
  public readonly cfnOutApiImagesUrl: cdk.CfnOutput;
  public readonly cfnOutApiLikesUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: RestApiStackProps) {
    super(scope, id, props);

    let lambdaApiHandlerPublic = new lambdaNodeJs.NodejsFunction(this, "ApiHandlerPublic", {
      entry: require.resolve("../lambdas/coffee-listing-api-public"),
      environment: {
        BUCKET_NAME: props.bucket.bucketName,
        BUCKER_UPLOAD_FOLDER_NAME: "uploads",
      },
    });
    props.bucket.grantReadWrite(lambdaApiHandlerPublic);

    let restApi = new apigateway.LambdaRestApi(this, "RestApi", {
      handler: lambdaApiHandlerPublic,
      proxy: false,
    });

    let apiImages = restApi.root.addResource("images", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });
    apiImages.addMethod("GET");
    apiImages.addMethod("POST");

    this.restApi = restApi;

    this.cfnOutApiImagesUrl = new cdk.CfnOutput(this, "CfnOutApiImagesUrl", {
      value: restApi.urlForPath("/images"),
      description: "Images API URL for `frontend/.env` file",
    });
  }
}
