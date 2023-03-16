import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { RestApiStack } from "./rest-api-stack";
import { WebsiteHostingStack } from "./website-hosting-stack";

export class CoffeeListingAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    let websiteHosting = new WebsiteHostingStack(this, "WebsiteHostingStack", {
      stackName: `WebsiteHostingStack-${this.stackName}`,
    });
    let restApi = new RestApiStack(this, "RestApiStack", {
      stackName: `RestApiStack-${this.stackName}`,
      bucket: websiteHosting.bucket,
      distribution: websiteHosting.distribution,
    });
  }
}
