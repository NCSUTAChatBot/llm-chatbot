from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.common.by import By
from webdriver_manager.firefox import GeckoDriverManager
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

def setup_driver():
    # Setup Firefox options
    options = FirefoxOptions()
    options.headless = True  # Run headless browser
    options.accept_insecure_certs = True 
    driver = webdriver.Firefox(service=FirefoxService(GeckoDriverManager().install()), options=options)
    return driver

def scrape_page_selenium(url, driver, visited):
    if url in visited:
        return
    visited.add(url)
    try:
        driver.get(url)
        time.sleep(2)  # Wait for JavaScript to load
    except Exception as e:
        print(f"Failed to retrieve {url}: {e}")
        return

    soup = BeautifulSoup(driver.page_source, 'html.parser')

    # Extract desired information
    title = soup.find('h1').get_text(strip=True) if soup.find('h1') else 'No Title'
    description = soup.find('p').get_text(strip=True) if soup.find('p') else 'No Description'
    print(f"Title: {title}\nDescription: {description}\n")

    # Find all links and recursively scrape them
    for link in soup.find_all('a', href=True):
        href = link['href']
        next_url = urljoin(url, href)
        if is_valid_url(next_url, url):
            scrape_page_selenium(next_url, driver, visited)
            time.sleep(1)

def is_valid_url(url, base_url):
    base_domain = urlparse(base_url).netloc
    target_domain = urlparse(url).netloc
    return base_domain == target_domain

if __name__ == "__main__":
    start_url = "https://www.csc2.ncsu.edu/faculty/efg/courses/517/f24/"
    visited = set()
    driver = setup_driver()
    try:
        scrape_page_selenium(start_url, driver, visited)
    finally:
        driver.quit()