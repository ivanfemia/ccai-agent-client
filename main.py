# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     https://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""This module handles the communication from the web applciation to the Dialogflow CX agent."""

import json
import os
import uuid
import proto

from flask import Flask, render_template, request, jsonify
from google.cloud.dialogflowcx_v3beta1.services.agents import AgentsClient
from google.cloud.dialogflowcx_v3beta1.services.sessions import SessionsClient
from google.cloud.dialogflowcx_v3beta1.types import session

app = Flask(__name__)
app.config.from_pyfile('config.py')

@app.route('/')
@app.route('/index')
def index():
    """ Index template route """
    return render_template('index.html')

@app.route('/send_message', methods=['POST'])
def send_message():
    """ Handles the communication with Dialogflow CX Agent """
    message = request.form['message']
    session_id = request.form['session_id']
    if not session_id:
        session_id = uuid.uuid4()
    project_id = os.getenv('DIALOGFLOW_PROJECT_ID')
    # For more information about regionalization see
    # https://cloud.google.com/dialogflow/cx/docs/how/region
    location_id = "us-central1"
    # For more info on agents see
    # https://cloud.google.com/dialogflow/cx/docs/concept/agent
    agent_id = os.getenv('DIALOGFLOW_AGENT_ID')
    language_code = "en-us"
    agent = f"projects/{project_id}/locations/{location_id}/agents/{agent_id}"
    fulfillment_text = detect_intent_text(agent, session_id, message, language_code)
    response_text = { "message":  fulfillment_text, "session_id" : session_id }
    return jsonify(response_text)

def detect_intent_text(agent, session_id, text, language_code):
    """Returns the result of detect intent with texts as inputs.

    Using the same `session_id` between requests allows continuation
    of the conversation."""
    session_path = f"{agent}/sessions/{session_id}"
    print(f"Session path: {session_path}\n")
    client_options = None
    agent_components = AgentsClient.parse_agent_path(agent)
    location_id = agent_components["location"]
    if location_id != "global":
        api_endpoint = f"{location_id}-dialogflow.googleapis.com:443"
        print(f"API Endpoint: {api_endpoint}\n")
        client_options = {"api_endpoint": api_endpoint}
    session_client = SessionsClient(client_options=client_options)

    text_input = session.TextInput(text=text)
    query_input = session.QueryInput(text=text_input, language_code=language_code)
    my_request = session.DetectIntentRequest(
        session=session_path, query_input=query_input
    )
    response = session_client.detect_intent(request=my_request)
    serializable_messages = [proto.Message.to_dict(message) for message in \
      response.query_result.response_messages]
    return json.dumps({'messages':serializable_messages})
