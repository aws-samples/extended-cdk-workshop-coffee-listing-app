import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { NagSuppressions } from "cdk-nag";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";

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

    // Adding suppressions at the stack level.
    NagSuppressions.addStackSuppressions(this, [
        { id: 'AwsSolutions-IAM4', reason: 'Only needed ReadWrite permissions, hence using AWS managed policies' },
        { id: 'AwsSolutions-IAM5', reason: 'Already using AWS managed policies, hence skipping wildcard permissions check' },
        { id: 'AwsSolutions-L1', reason: 'Using a non-container lambda function since it has custom logic' },
        { id: 'AwsSolutions-APIG6',reason: 'Disabling CloudWatch logs for PROD DeploymentStage' },
        { id: 'AwsSolutions-APIG1',reason: 'Disabling access logging for PROD DeploymentStage' },
        { id: 'AwsSolutions-APIG3',reason: 'Not adding AWS WAF integration for PROD DeploymentStage' },
        { id: 'AwsSolutions-APIG4', reason: 'Skipping API authorization for API images route' },
        { id: 'AwsSolutions-COG4', reason: 'No API authorization added, hence Amazon Cognito resource was not created and used' }
    ]);

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

    // Adding suppressions at the resource level.
    NagSuppressions.addResourceSuppressions(restApi, [
      { id: 'AwsSolutions-APIG2', reason: 'Skipping & not adding API request validation' }
    ]);

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
