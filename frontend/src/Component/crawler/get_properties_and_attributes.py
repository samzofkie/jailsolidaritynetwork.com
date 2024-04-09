#!/usr/bin/python3
import os
from bs4 import BeautifulSoup
import urllib.request

def page_cached(filename):
  return os.path.exists(filename)

def request_page(url):
  with urllib.request.urlopen(url) as f:
      html = f.read().decode('utf8')
  return html

def cache_page(html, filename):
  with open(filename, 'w') as f:
      f.write(html)

def read_cached_page(filename):
  with open(filename, 'r') as f:
      html = f.read()
  return html

def get_page(url, cache_filename):
  if not page_cached(cache_filename):
    print('requesting ' + url + '...')
    html = request_page(url)
    cache_page(html, cache_filename)
  else:
    html = read_cached_page(cache_filename)
  return html

def find_css_properties_in_page(html):
  soup = BeautifulSoup(html, 'html.parser')
  tables_div = soup.find(id='cssproperties')
  return [row.find('td').get_text().strip() for row in tables_div.find_all('tr')]

def get_css_properties():
  url = 'https://www.w3schools.com/cssref/index.php'
  cache_filename = './css-ref.html'
  html = get_page(url, cache_filename)
  return find_css_properties_in_page(html)

def ensure_css_properties():
  filename = './css-properties.txt'
  if not os.path.exists(filename):
    with open(filename, 'w') as f:
      f.write('\n'.join(get_css_properties()) + '\n')

def find_html_attributes_in_page(html):
  soup = BeautifulSoup(html, 'html.parser')
  table = soup.find(class_='ws-table-all')
  rows = [row for row in table.find_all('tr')]
  return [row.find('td').get_text().strip() for row in rows if row.find('td')]

def get_html_properties():
  url = 'https://www.w3schools.com/tags/ref_attributes.asp'
  cache_filename = 'html-ref.html'
  html = get_page(url, cache_filename)
  return find_html_attributes_in_page(html)
  print(html)

def ensure_html_attributes():
  filename = './html-attributes.txt'
  if not os.path.exists(filename):
    with open(filename, 'w') as f:
      f.write('\n'.join(get_html_properties()) + '\n')

if __name__ == '__main__':
  ensure_css_properties()
  ensure_html_attributes()