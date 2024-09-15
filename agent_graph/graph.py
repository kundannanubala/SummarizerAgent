from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from agents.agents import SummarizerAgent
from states.state import AgentGraphState
from prompts.prompts import summarization_prompt_template
import requests
from termcolor import colored
import feedparser
import json
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import re

def xml_parser_url_collection(state):
    # Fetch URLs from the urls collection using the defined route
    try:
        response = requests.get('http://localhost:5000/api/urls')
        response.raise_for_status()
        rss_feed_urls = [url_doc['url'] for url_doc in response.json()]
    except requests.exceptions.RequestException as e:
        print(colored(f"Failed to fetch URLs from the database: {e}", 'red'))
        return {"articles": []}

    articles = []
    days_ago = 0 # Adjust this value to change the date range
    target_date = (datetime.utcnow() - timedelta(days=days_ago)).date()

    for url in rss_feed_urls:
        try:
            feed = feedparser.parse(url)
            if feed.bozo:
                print(colored(f"Failed to parse RSS feed from {url}: {feed.bozo_exception}", 'red'))
                continue

            for entry in feed.entries:
                published_date_str = entry.get("published", "")
                if not published_date_str:
                    continue

                try:
                    published_date = datetime.strptime(published_date_str, "%a, %d %b %Y %H:%M:%S %Z")
                except ValueError:
                    try:
                        published_date = datetime.strptime(published_date_str, "%a, %d %b %Y %H:%M:%S %z")
                    except ValueError:
                        print(colored(f"Unable to parse date: {published_date_str}", 'yellow'))
                        continue

                if published_date.date() == target_date:
                    article = {
                        "title": entry.get("title", "No Title"),
                        "link": entry.get("link", "No Link"),
                        "author": entry.get("author", "Unknown Author"),
                        "published_date": published_date.isoformat(),
                        "xml_url":url,
                    }
                    articles.append(article)

        except Exception as e:
            print(colored(f"Failed to fetch or parse RSS feed from {url}: {e}", 'red'))

    parsed_articles = {"articles": articles}

    # Save articles to the database
    if articles:
        try:
            response = requests.post('http://localhost:5000/api/articles', json=parsed_articles)
            response.raise_for_status()
            print(colored(f"Saved {len(articles)} articles from {days_ago} days ago to database successfully", 'green'))
        except requests.exceptions.RequestException as e:
            print(colored(f"Failed to save articles to database: {e}", 'red'))
    else:
        print(colored(f"No articles from {days_ago} days ago found to save", 'yellow'))

    with open("D:/VentureInternship/AI Agent/SummarizerAgent/server/response.txt", "a") as file:
        file.write(f"\nXML_parser_Tool: Fetched {len(articles)} articles from {days_ago} days ago")
    
    # Make sure to update state instead of returning a new dict
    state['articles'] = parsed_articles['articles']
    return state

def xml_parser_new_urls(state):
    # Fetch URLs from the new_urls collection using the defined route
    try:
        response = requests.get('http://localhost:5000/api/urls/new')
        response.raise_for_status()
        new_urls = response.json()
    except requests.exceptions.RequestException as e:
        print(colored(f"Failed to fetch URLs from the database: {e}", 'red'))
        return

    if not new_urls:
        print(colored("No URLs found in the new_urls collection", 'yellow'))
        return

    articles = []
    for url_doc in new_urls:
        url = url_doc['url']
        try:
            feed = feedparser.parse(url)
            if feed.bozo:
                print(colored(f"Failed to parse RSS feed from {url}: {feed.bozo_exception}", 'red'))
                continue

            for entry in feed.entries:
                article = {
                    "title": entry.get("title", "No Title"),
                    "link": entry.get("link", "No Link"),
                    "author": entry.get("author", "Unknown Author"),
                    "published_date": entry.get("published", "Unknown Date"),
                    "xml_url":url,
                }
                articles.append(article)

            # Update lastChecked for this URL
            update_data = {
                'lastChecked': datetime.utcnow().isoformat()
            }
            update_response = requests.put(f'http://localhost:5000/api/urls/new/{url_doc["_id"]}', json=update_data)
            if update_response.status_code == 404:
                print(colored(f"URL with id {url_doc['_id']} not found in the database", 'yellow'))
            else:
                update_response.raise_for_status()

        except Exception as e:
            print(colored(f"Failed to fetch or parse RSS feed from {url}: {e}", 'red'))

    parsed_articles = {"articles": articles}

    # Save articles to the database
    try:
        response = requests.post('http://localhost:5000/api/articles', json=parsed_articles)
        response.raise_for_status()
        print(colored(f"Saved {len(articles)} articles to database successfully", 'green'))
    except requests.exceptions.RequestException as e:
        print(colored(f"Failed to save articles to database: {e}", 'red'))

    # Transfer URLs from new_urls to urls collection and then delete from new_urls
    for url_doc in new_urls:
        try:
            # Prepare the URL document for the urls collection
            url_data = {
                'url': url_doc['url'],
                'dateAdded': url_doc.get('dateAdded', datetime.utcnow().isoformat()),
                'lastChecked': url_doc.get('lastChecked', datetime.utcnow().isoformat()),
                'status': url_doc.get('status', 'active')
            }

            # Add URL to urls collection
            add_response = requests.post('http://localhost:5000/api/urls', json=url_data)
            add_response.raise_for_status()
            print(colored(f"Added URL {url_doc['url']} to urls collection", 'green'))

            # Delete URL from new_urls collection
            delete_response = requests.delete(f'http://localhost:5000/api/urls/new/{url_doc["_id"]}')
            if delete_response.status_code == 404:
                print(colored(f"URL with id {url_doc['_id']} not found for deletion in new_urls", 'yellow'))
            else:
                delete_response.raise_for_status()
                print(colored(f"Deleted URL with id {url_doc['_id']} from new_urls collection", 'green'))
        except requests.exceptions.RequestException as e:
            print(colored(f"Failed to transfer URL {url_doc['url']}: {e}", 'red'))

    with open("D:/VentureInternship/AI Agent/SummarizerAgent/server/response.txt", "a") as file:
        file.write(f"\nXML_parser_Tool: Processed {len(new_urls)} URLs, found {len(articles)} articles, transferred URLs to urls collection, and deleted from new_urls")

    # Make sure to update state instead of returning a new dict
    # state['articles'] += parsed_articles['articles']
    state['articles'] = parsed_articles['articles']
    return state

def scrape_website(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        paragraphs = soup.find_all('p')
        content = "\n".join([para.get_text() for para in paragraphs])
        return content
    except requests.RequestException as e:
        print(colored(f"Failed to scrape content from {url}: {e}", 'red'))
        return None
def content_scraper_tool(state):
    # Get articles from the articles collection and clear it
    try:
        response = requests.get('http://localhost:5000/api/scraped-articles/scrape-and-clear')
        response.raise_for_status()
        articles = response.json()['articles']
    except requests.RequestException as e:
        print(colored(f"Failed to get articles: {e}", 'red'))
        return

    articles_with_content = []

    for article in articles:
        if 'link' in article:
            print(colored(f"Scraping URL: {article['link']}", 'blue'))
            content = scrape_website(article['link'])
            if content:
                article['content'] = content
                articles_with_content.append(article)
                print(colored(f"Content scraped for: {article['link']}", 'green'))
            else:
                print(colored(f"No content found for: {article['link']}", 'yellow'))
        else:
            print(colored(f"No link found in article: {article}", 'red'))

    articles_with_content_json = {"articles": articles_with_content}

    # Split articles into batches of 10 (adjust as needed)
    batch_size = 10
    for i in range(0, len(articles_with_content), batch_size):
        batch = articles_with_content[i:i+batch_size]
        batch_json = {"articles": batch}

        # Store the batch of scraped articles in the database
        try:
            response = requests.post('http://localhost:5000/api/scraped-articles', json=batch_json)
            response.raise_for_status()
            print(colored(f"Batch of {len(batch)} scraped articles saved to database successfully", 'green'))
        except requests.RequestException as e:
            print(colored(f"Failed to save batch of scraped articles to database: {e}", 'red'))

    with open("D:/VentureInternship/response.txt", "a") as file:
        file.write(f"\nContent_Scraper_Tool")
    # Make sure to update state instead of returning a new dict
    state['articles'] = articles_with_content
    return state

def fetch_articles_from_api(state):
    try:
        response = requests.get('http://localhost:5000/api/scraped-articles')
        response.raise_for_status()
        articles = response.json()
        print(colored(f"Fetched {len(articles)} articles from the API", 'green'))
        state["articles"] = articles
        return state
    except requests.RequestException as e:
        print(colored(f"Failed to fetch articles from the API: {e}", 'red'))
        state["articles"] = []
        return state

def keyword_mapping_tool(state):
    # Fetch scraped articles
    try:
        articles_response = requests.get('http://localhost:5000/api/scraped-articles')
        articles_response.raise_for_status()
        scraped_articles = articles_response.json()
    except requests.RequestException as e:
        print(colored(f"Failed to fetch scraped articles: {e}", 'red'))
        return state

    # Fetch summaries
    try:
        summaries_response = requests.get('http://localhost:5000/api/summaries')
        summaries_response.raise_for_status()
        summaries = summaries_response.json()
    except requests.RequestException as e:
        print(colored(f"Failed to fetch summaries: {e}", 'red'))
        return state

    # Fetch keywords
    try:
        keywords_response = requests.get('http://localhost:5000/api/keywords')
        keywords_response.raise_for_status()
        keywords = keywords_response.json()
    except requests.RequestException as e:
        print(colored(f"Failed to fetch keywords: {e}", 'red'))
        return state

    # Create a dictionary to map article titles to their summaries
    title_to_summary = {summary['title']: summary for summary in summaries}

    # Map keywords to scraped articles and then to summaries
    for article in scraped_articles:
        matched_keyword_ids = []
        for keyword in keywords:
            pattern = r'\b' + re.escape(keyword['keyword']) + r'\b'
            if re.search(pattern, article['title'], re.IGNORECASE) or \
               re.search(pattern, article['content'], re.IGNORECASE):
                matched_keyword_ids.append(keyword['_id'])

        if matched_keyword_ids:
            # Find the corresponding summary
            summary = title_to_summary.get(article['title'])
            if summary:
                # Update the summary with matched keyword IDs
                try:
                    update_response = requests.put(
                        f"http://localhost:5000/api/summaries/{summary['_id']}/keywords",
                        json={"keyword_ids": matched_keyword_ids}
                    )
                    update_response.raise_for_status()
                    print(colored(f"Updated summary for '{article['title']}' with keywords: {matched_keyword_ids}", 'green'))
                except requests.RequestException as e:
                    print(colored(f"Failed to update summary for '{article['title']}': {e}", 'red'))
            else:
                print(colored(f"No corresponding summary found for article: '{article['title']}'", 'yellow'))

    print(colored("Keyword mapping completed.", 'green'))

    # Update state with the keyword-mapped summaries
    state['keyword_mapped_summaries'] = summaries
    return state

def create_graph(server=None, model=None, stop=None, model_endpoint=None, temperature=0):
    graph = StateGraph(AgentGraphState)

    # Add nodes
    graph.add_node("xml_parser_url_collection", xml_parser_url_collection)
    graph.add_node("xml_parser_new_urls", xml_parser_new_urls)
    graph.add_node("content_scraper", content_scraper_tool)
    graph.add_node("fetch_articles", fetch_articles_from_api)
    graph.add_node("summarizer", lambda state: SummarizerAgent(
        state=state,
        model=model,
        server=server,
        stop=stop,
        model_endpoint=model_endpoint,
        temperature=temperature
    ).invoke(state))
    graph.add_node("keyword_mapping", keyword_mapping_tool)

    # Add edges
    graph.add_edge("xml_parser_url_collection", "xml_parser_new_urls")
    graph.add_edge("xml_parser_new_urls", "content_scraper")
    graph.add_edge("content_scraper", "fetch_articles")
    graph.add_edge("fetch_articles", "summarizer")
    graph.add_edge("summarizer", "keyword_mapping")

    # Set entry and finish points
    graph.set_entry_point("xml_parser_url_collection")
    graph.set_finish_point("keyword_mapping")

    return graph

def compile_workflow(graph):
    workflow = graph.compile()
    return workflow