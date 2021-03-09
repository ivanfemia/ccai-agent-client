# Client for Dialogflow CX

## Description

This is a very simple client in Python to interact with a Dialogflow CX agent as described in the blog [Application modernization with Google Cloud Platform: Chatbots](https://blogs.sap.com/2021/03/09/application-modernization-with-google-cloud-platform-chatbots/)

## Configuration

### Deploying on GCP

1. Make a copy of the app.yaml.SAMPLE

```shell
cd ccai-agent-client 
cp .gcloudignore.SAMPLE .gcloudignore 
cp app.yaml.SAMPLE app.yaml
```

1. Complete the configuration with your parameters DIALOGFLOW_PROJECT_ID and DIALOGFLOW_AGENT_ID

1. Deploy on GCP AppEngine Standard enviroment 

```shell
gcloud app deploy --quiet --project *Your GCP project id*
```
