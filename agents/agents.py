from termcolor import colored
from models.openai_models import get_open_ai, get_open_ai_json
from models.ollama_models import OllamaModel, OllamaJSONModel
from models.vllm_models import VllmJSONModel, VllmModel
from models.groq_models import GroqModel, GroqJSONModel
from models.claude_models import ClaudVertexModel, ClaudVertexJSONModel
from models.gemini_models import GeminiModel, GeminiJSONModel
from langchain_core.messages import HumanMessage
import json
from datetime import datetime
from prompts.prompts import (
summarization_prompt_template
)
from utils.helper_functions import get_current_utc_datetime, check_for_content
from states.state import AgentGraphState
from states.state import get_agent_graph_state

class Agent:
    def __init__(self, state: AgentGraphState, model=None, server=None, temperature=0, model_endpoint=None, stop=None, guided_json=None):
        self.state = state
        self.model = model
        self.server = server
        self.temperature = temperature
        self.model_endpoint = model_endpoint
        self.stop = stop
        self.guided_json = guided_json

    def get_llm(self, json_model=True):
        if self.server == 'openai':
            return get_open_ai_json(model=self.model, temperature=self.temperature) if json_model else get_open_ai(model=self.model, temperature=self.temperature)
        if self.server == 'ollama':
            return OllamaJSONModel(model=self.model, temperature=self.temperature) if json_model else OllamaModel(model=self.model, temperature=self.temperature)
        if self.server == 'vllm':
            return VllmJSONModel(
                model=self.model, 
                guided_json=self.guided_json,
                stop=self.stop,
                model_endpoint=self.model_endpoint,
                temperature=self.temperature
            ) if json_model else VllmModel(
                model=self.model,
                model_endpoint=self.model_endpoint,
                stop=self.stop,
                temperature=self.temperature
            )
        if self.server == 'groq':
            return GroqJSONModel(
                model=self.model,
                temperature=self.temperature
            ) if json_model else GroqModel(
                model=self.model,
                temperature=self.temperature
            )
        if self.server == 'claude':
            return ClaudVertexJSONModel(
                model=self.model,
                temperature=self.temperature
            ) if json_model else ClaudVertexModel(
                model=self.model,
                temperature=self.temperature
            )
        if self.server == 'gemini':
            return GeminiJSONModel(
                model=self.model,
                temperature=self.temperature
            ) if json_model else GeminiModel(
                model=self.model,
                temperature=self.temperature
            )      

    def update_state(self, key, value):
        self.state = {**self.state, key: value}


import requests

class SummarizerAgent(Agent):
    def invoke(self, state):
        articles = state.get("articles", [])
        prompt = summarization_prompt_template.format(articles=json.dumps(articles, indent=2))

        messages = [
            {"role": "system", "content": prompt},
            {"role": "user", "content": "Please provide your summaries."}
        ]

        llm = self.get_llm()
        ai_msg = llm.invoke(messages)

        # Log the response
        with open("D:/VentureInternship/AI Agent/ProjectK/response.txt", 'a') as file:
            file.write(f'\nSummarizer response:{ai_msg.content}\n')

        # Update the state with the agent's response
        state["messages"].append(
            HumanMessage(role="summarizer", content=ai_msg.content)
        )

        # Parse the summaries and store them in the database
        try:
            summaries = json.loads(ai_msg.content)["summaries"]

            # Store summaries in the database
            try:
                response = requests.post('http://localhost:5000/api/summaries', json={"summaries": summaries})
                response.raise_for_status()
                print(colored(f"Stored {len(summaries)} summaries in the database", 'green'))

                # Add the stored summaries to the state
                state["summaries"] = summaries
            except requests.RequestException as e:
                print(colored(f"Failed to store summaries in the database: {e}", 'red'))

        except json.JSONDecodeError:
            print(colored("Failed to parse summarizer response as JSON", 'red'))

        return state