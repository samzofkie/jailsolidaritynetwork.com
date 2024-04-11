#!/usr/bin/python3
import os
from bs4 import BeautifulSoup
import urllib.request

'''
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

def get_html_attributes():
  url = 'https://www.w3schools.com/tags/ref_attributes.asp'
  cache_filename = 'html-ref.html'
  html = get_page(url, cache_filename)
  return find_html_attributes_in_page(html)
  print(html)

def ensure_html_attributes():
  filename = './html-attributes.txt'
  if not os.path.exists(filename):
    with open(filename, 'w') as f:
      f.write('\n'.join(get_html_attributes()) + '\n')'''

class Ensurer:
  def __init__(self, url, output_filename, js_object_name, cached_html_filename):
    self.url = url
    self.output_filename = output_filename
    self.js_object_name = js_object_name
    self.cached_html_filename = cached_html_filename

  def request_html(self):
    print('requesting ' + self.url + '...')
    with urllib.request.urlopen(self.url) as f:
      self.html = f.read().decode('utf8')

  def cache_html(self):
    with open(self.cached_html_filename, 'w') as f:
      f.write(self.html)

  def read_html_from_file(self):
    with open(self.cached_html_filename, 'r') as f:
      self.html = f.read()

  def ensure_html(self):
    if not os.path.exists(self.cached_html_filename):
      self.request_html()
      self.cache_html()
    else:
      self.read_html_from_file()

  @staticmethod
  def to_camel_case(string):
    words = string.split('-')
    for i in range(1, len(words)):
      words[i] = words[i].capitalize()
    return ''.join(words)

  def parse_html(self):
    pass

  def write_output_to_json(self):
    with open(self.output_filename, 'w') as f:
      f.write(f"export const {self.js_object_name} = [" + ', '.join([f'"{prop}"' for prop in self.output])+ "];")

  def ensure(self):
    if not os.path.exists(self.output_filename):
      self.ensure_html()
      self.parse_html()
      self.write_output_to_json()

'''
Currently, the only properties that are in both cssProperties and 
	htmlAtrributes are
	  - `border`
		- `color`
		- `content`
		- `height`
		- `translate`
		- `width`
	Of these, all except for `content` are no longer supported or unequivocally
	best handled by CSS.

	`content` has two different meaningful meanings in both HTML and CSS.
	However, the programming style encouraged by this framework would use
	JavaScript to implement the functionality provided by CSS's `content`, so we
	deem `content` an HTML attribute (it's possible that `content` could be
	implemented in either way, depending on the tag of the Component, since it's
	HTML meaning currently only applies to `<meta>` elements).
'''

class CSSPropertiesEnsurer(Ensurer):
  def __init__(self):
    super().__init__('https://www.w3schools.com/cssref/index.php', 'cssProperties.js', 'cssProperties', 'css-ref.html')
  
  def parse_html(self):
    soup = BeautifulSoup(self.html, 'html.parser')
    tables_div = soup.find(id='cssproperties')
    properties = [row.find('td').get_text().strip() for row in tables_div.find_all('tr')]
    properties = [self.to_camel_case(prop) for prop in properties]
    # See above comment
    self.output = [prop for prop in properties if prop != 'content']

class HTMLAttributesEnsurer(Ensurer):
  def __init__(self):
    super().__init__('https://www.w3schools.com/tags/ref_attributes.asp', 'htmlAttributes.js', 'htmlAttributes', 'html-ref.html')
  
  def parse_html(self):
    soup = BeautifulSoup(self.html, 'html.parser')
    table = soup.find(class_='ws-table-all')
    rows = [row for row in table.find_all('tr')]
    attributes = [row.find('td').get_text().strip() for row in rows if row.find('td')]
    attributes = [self.to_camel_case(attribute) for attribute in attributes]
    # See above comment
    self.output = [attr for attr in attributes if attr not in ['border', 'color', 'height', 'width', 'translate']]


if __name__ == '__main__':
  CSSPropertiesEnsurer().ensure()
  HTMLAttributesEnsurer().ensure()