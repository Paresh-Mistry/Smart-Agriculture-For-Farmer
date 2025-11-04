from beautifulsoup4 import BeautifulSoup
from selenium import webdriver

url = "https://www.accuweather.com/en/in/byculla-west/3352422/weather-forecast/3352422?city=delhi"
browser = webdriver.Chrome()

browser.get(url)
time.sleep(5)
html = browser.page_source

soup = BeautifulSoup(html, 'html.parser')

tags = soup.find_all("div", {"class" : "temp"})

for tag in tags:
    print("Temperature: ", tags)