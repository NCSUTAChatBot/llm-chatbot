'''
@file webscraper.py
This file contains the code to extract information fromcourse websites and store them in a json file.

@author by Dinesh Kannan (dkannan)
'''

import json
from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from bs4 import BeautifulSoup
from webdriver_manager.firefox import GeckoDriverManager
from urllib.parse import urljoin
import time

#Setting up Firefox options
options = FirefoxOptions()
options.headless = True  # Run headless browser
options.accept_insecure_certs = True  # Bypass SSL certificate errors

driver= webdriver.Firefox(service=FirefoxService(GeckoDriverManager().install()), options=options)

#Parsing page source with BeautifulSoup
soup= BeautifulSoup(driver.page_source, 'html.parser')

# List of social media platforms to ignore further processing
social_media_domains = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'snapchat.com']

# List of video platforms
video_domains = ['youtube.com', 'vimeo.com']

# Extract information from tables
def extract_table_data(soup):
    tables = []
    for table in soup.find_all('table'):
        table_data = []
        for row in table.find_all('tr'):
            row_data = [cell.get_text(strip=True) for cell in row.find_all(['td', 'th'])]
            table_data.append(row_data)
        tables.append(table_data)
    return tables

# Extract information from lists (ordered and unordered)
def extract_list_data(soup):
    lists = []
    for ul in soup.find_all('ul'):
        list_items = [li.get_text(strip=True) for li in ul.find_all('li')]
        lists.append(list_items)
    
    for ol in soup.find_all('ol'):
        list_items = [li.get_text(strip=True) for li in ol.find_all('li')]
        lists.append(list_items)
    
    return lists

# Extract general text content, preserving structure for tables and lists
def extract_content_with_structure(soup):
    content = {}

    # Extracting table data
    tables = extract_table_data(soup)
    if tables:
        content['tables'] = tables

    # Extracting list data
    lists = extract_list_data(soup)
    if lists:
        content['lists'] = lists
    
    # Fallback to extracting all other text
    raw_text = soup.get_text(separator=' ', strip=True)
    content['raw_text'] = raw_text
    
    return content

# Check if the URL belongs to a social media platform
def is_social_media_link(link):
    return any(domain in link for domain in social_media_domains)

# Check if the URL is a video link (e.g., YouTube or Vimeo)
def is_video_link(link):
    return any(domain in link for domain in video_domains)

# Extract information from a single page
def extract_info(url):
    try:
        driver.get(url)
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Extract structured content with tables, lists, and raw text
        structured_content = extract_content_with_structure(soup)
        
        # Extracting all links
        links = [urljoin(url, a['href']) for a in soup.find_all('a', href=True) if not is_social_media_link(a['href']) and not is_video_link(a['href'])]
        
        return {'url': url, 'content': structured_content, 'links': links}
    
    except Exception as e:
        print(f"Error occurred while extracting {url}: {str(e)}")
        return {'url': url, 'content': {}, 'links': []}

# Main scraping logic
def scrape_website(url):
    visited_links = set()  # To track visited links
    data = extract_info(url)  # Extract info from the main page
    
    main_page_data = {'url': url, 'content': data['content'], 'links': []}
    inner_page_data = []  # To hold data for inner pages (one layer deep)

    
    # Now process the links found on the main page (one layer deep)
    for link in data['links']:
        if link in visited_links:
            continue  # Skip if already visited
                
        # For all other links, extract the content (but no deeper sublinks)
        if link.startswith('http'):
            time.sleep(1)  # Optional: Add delay to avoid overloading the server
            page_data = extract_info(link)  # Extract structured content and links
            inner_page_data.append({'url': link, 'content': page_data['content']})
            visited_links.add(link)
    
    # Structure the data, combining main page, inner pages, video links, and social media links
    return {
        'main_page': main_page_data,
        'inner_pages': inner_page_data,  # Only first layer deep
    }

url="https://crlt.umich.edu/"
driver.get(url)

scraped_data = scrape_website(url)

# Closing the browser
driver.quit()

# Saving data to JSON
with open('../courseWebsiteData/UMich_scraped_data.json', 'w') as f:
    json.dump(scraped_data, f, indent=4)

print("Website information extracted and saved to scraped_data.json")
