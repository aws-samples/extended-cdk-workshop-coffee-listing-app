import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as cloudfrontOrigins from "@aws-cdk/aws-cloudfront-origins";

export class WebsiteHostingStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly cfnOutCloudFrontUrl: cdk.CfnOutput;
  public readonly cfnOutBucketName: cdk.CfnOutput;
  public readonly cfnOutDistributionId: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let bucket = new s3.Bucket(this, "Bucket", {
      cors: [
        {
          allowedMethods: [s3.HttpMethods.POST],
          allowedOrigins: ["*"],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    let distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(bucket, {
          originPath: "/frontend",
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        "/uploads/*": {
          origin: new cloudfrontOrigins.S3Origin(bucket, {
            originPath: "/",
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    });

    this.bucket = bucket;
    this.distribution = distribution;

    this.cfnOutCloudFrontUrl = new cdk.CfnOutput(this, "CfnOutCloudFrontUrl", {
      value: `https://${distribution.distributionDomainName}`,
      description: "URL for CLOUDFRONT_URL in `frontend/.env` file",
    });
    this.cfnOutDistributionId = new cdk.CfnOutput(
      this,
      "CfnOutDistributionId",
      {
        value: distribution.distributionId,
        description: "CloudFront Distribution Id",
      }
    );
    this.cfnOutBucketName = new cdk.CfnOutput(this, "CfnOutBucketName", {
      value: bucket.bucketName,
      description: "Website Hosting Bucket Name",
    });
  }
}
