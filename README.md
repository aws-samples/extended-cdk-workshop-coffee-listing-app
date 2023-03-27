## Extended CDK Workshop - Coffee Listing App

This is the initial code for [Extended CDK Workshop](https://catalog.us-east-1.prod.workshops.aws/v2/workshops/071bbc60-6c1f-47b6-8c66-e84f5dc96b3f/en-US), where we will be building the infrastructure for a Coffee Listing application. You will be able to upload, list and vote on coffee photos, while deployinig everything to the cloud with AWS CDK.

As a starting point, you will clone this repository with the sample code and built on top of it.

The initial code for the workshop contains:

- A project initialized with CDK v1 in TypeScript
- `frontend/` folder with the React.js application
- `lambdas/` folder with the handlers for our API Gateway Rest API
- `lib/` folder with all initial stacks for the project

Take your time to explore the architecture in this section, familiarize yourself with the dependencies and [CDK Construct Library](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-construct-library.html).

# Application Architecture

As a starting point we will work with a AWS CDK v1 TypeScript Stack and a Front-End application with a few features.

By the end of this workshop, our application will have:

- A front-end application served by CloudFront hosted on Amazon S3
- API Gateway with Rest Api to list images, create a presigned url to upload photos and upvote and downvote photo
- DynamoDB to store photo votes
- VPC with VPC Endpoint in a CloudFormation template, which will be imported by CDK

# Publishing To Other Languages

In the last part of the workshop, we will export the final infrastructure from TypeScript to different languages, upload the artifact to CodeArtifact and, using Python, install our application package and use it to build a new Python based AWS CDK Stack.

# USAGE DISCLAIMER

Code in this repo. is not production ready, it contains code only used for demo app for AWS Extended CDK workshop.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

