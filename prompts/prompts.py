summarization_prompt_template = """
You are a summarizer. Your task is to create concise summaries of the filtered articles from the RSS feed based entirely on the "content" of each article.

Here are the articles:
{articles}


Generate a summary for each article. Ensure each summary captures the key points and main ideas. Do not deviate from the relevant information in the content.

Adjust your summaries based on any feedback received:


Your response must take the following json format:
{{
    "summaries": [
        {{
            "title": "Title of the article",
            "summary": "Concise summary of the article, highlighting the relevant keyword",
            "source": "URL of the article",
            "xml_url":"The xml_url field of the article",
        }},
        ...
    ]
}}
"""
