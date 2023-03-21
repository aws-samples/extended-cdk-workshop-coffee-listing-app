import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { NagSuppressions } from "cdk-nag";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";

export class WebsiteHostingStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;
  public readonly cfnOutCloudFrontUrl: cdk.CfnOutput;
  public readonly cfnOutBucketName: cdk.CfnOutput;
  public readonly cfnOutDistributionId: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Suppressing AwsSolutions-S1.
    NagSuppressions.addStackSuppressions(this, [
      { id: 'AwsSolutions-S1', reason: 'S3 bucket only used for static-web-hosting' }
    ]);

    // Remediating AwsSolutions-S10 by enforcing SSL on the bucket.
    let bucket = new s3.Bucket(this, "Bucket", {
      enforceSSL: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.POST],
          allowedOrigins: ["*"],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // Suppressing AwsSolutions-S2.
    NagSuppressions.addResourceSuppressions(bucket, [
      { id: 'AwsSolutions-S2', reason: 'S3 bucket only used for static-web-hosting, hence enabling public access' }
    ]);

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
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    });
    this.bucket = bucket;
    this.distribution = distribution;

    // Adding suppressions at the resource level.
    NagSuppressions.addResourceSuppressions(distribution, [
      { id: 'AwsSolutions-CFR1', reason: 'CloudFront distribution for web-hosting, hence no Geo restrictions' },
      { id: 'AwsSolutions-CFR2', reason: 'CloudFront distribution for web-hosting, hence not adding AWS WAF' },
      { id: 'AwsSolutions-CFR3', reason: 'CloudFront distribution for web-hosting, hence not enabling access logging' },
      { id: 'AwsSolutions-CFR4', reason: 'CloudFront distribution for web-hosting, allowing for SSLv3 or TLSv1 for HTTPS viewer connections' }
    ]);

    this.cfnOutCloudFrontUrl = new cdk.CfnOutput(this, "CfnOutCloudFrontUrl", {
      value: `https://${distribution.distributionDomainName}`,
      description: "URL for CLOUDFRONT_URL in `frontend/.env` file",
    });
    this.cfnOutDistributionId = new cdk.CfnOutput(this, "CfnOutDistributionId", {
      value: distribution.distributionId,
      description: "CloudFront Distribution Id",
    });
    this.cfnOutBucketName = new cdk.CfnOutput(this, "CfnOutBucketName", {
      value: bucket.bucketName,
      description: "Website Hosting Bucket Name",
    });
  }
}
