# import requests
from bs4 import BeautifulSoup
from selenium import webdriver

url = "https://music.apple.com/ph/album/dreaming-out-loud-deluxe/1444039555"
browser = webdriver.PhantomJS()
browser.get(url)
# x = requests.get(url)
html = browser.page_source
soup = BeautifulSoup(html, 'html.parser')
# soup = BeautifulSoup(x.text, 'html.parser')
links = soup.find_all('a');

# albums = []

for link in links:
  href = link.get('href');
  print(href);

#   if href.find("/song/") != -1:
#     albums.append(link)
# print(albums)

# albums = list(dict.fromkeys(albums))

# for album in albums:
#   with open("download.sh", "a") as file:
#     file.write('gamdl "'+album+'"\n')