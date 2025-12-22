#!/usr/bin/env python3
import http.server
import socket
import urllib.parse
import os.path
import sys
import json
import time

def output_line_buffering():
    """Force line-buffering of output. Useful under `concurrently`."""
    sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', 1)
    sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', 1)

class Handler(http.server.SimpleHTTPRequestHandler):
  def translate_path(self, path):
    # Check if we have a path override (for conditional routing)
    if hasattr(self, 'path_override'):
      path = self.path_override
      delattr(self, 'path_override')  # Clear it after using
    
    # http.server deliberately preserves trailing '/' (https://bugs.python.org/issue17324).
    # But our APIs generally treat 'foos/?...' same as 'foos?...',
    # and we prefer 'foos.json' files to ugly 'foos/.json', so strip it.
    path = super().translate_path(path).rstrip('/') + '.json'
    # Strip prefixes here because wasn't sure how to strip them with insights-proxy.
    path = path.replace('mockdata/openshift_api', 'mockdata')
    path = path.replace('mockdata/mockdata', 'mockdata')
    print('Accessing ' + path)
    return path


  def handle_request(self):
    path = self.translate_path(self.path)
    if os.path.isdir(path):
      return http.server.SimpleHTTPRequestHandler.do_GET(self)

    try:
      f = open(path, 'r')
    except OSError:
      self.send_error(404, "File not found: %s" % path)
      return
  
    try:
      response = self.match(f)
      response = self.inject(response)
      if '_meta_' in response:
        del response['_meta_']
      if 'kind' in response and response['kind'] == 'Error':
        self.send_response(500, None)
      else:
        self.send_response(200, None)
      self.end_headers()
      self.wfile.write(json.dumps(response).encode('utf-8'))
    finally:
      f.close()


  def do_GET(self):
    parts = urllib.parse.urlparse(self.path)
    params = urllib.parse.parse_qs(parts.query)
    if self.path == '/api/aggregator/v1/clusters/8b00e902-f675-4903-9118-91a8f9f5110a/report':
        self.send_response(401, '')
        self.end_headers()
        return

    # UI for [un]install logs keeps polling with ?offset and if we return same static JSON
    # it will keep appending it.  So return empty content after first response.
    if 'offset' in params and int(params['offset'][0]) > 0:
        self.send_response(200, '')
        self.end_headers()
        self.wfile.write(b'{"content": ""}')
        return

    # Check if this is a clusters API call with a search parameter for cluster IDs
    # If so, use the clustersForAccessRequest.json file instead
    if '/api/clusters_mgmt/v1/clusters' in parts.path and 'search' in params:
        search_param = params['search'][0].lower()
        # Check if the search contains "id in" pattern (for cluster ID filtering)
        if 'id in' in search_param or 'id=' in search_param:
            # Override the path to use clustersForAccessRequest.json
            self.path_override = '/api/clusters_mgmt/v1/clustersForAccessRequest'
            return self.handle_request()

    return self.handle_request()

  def end_headers(self):
    """ override end_headers to append headers to every request """
    # Allow CORS.
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Methods', '*')
    self.send_header('Access-Control-Allow-Headers', 'authorization, content-type')
    # Disable caching - https://stackoverflow.com/a/25708957/239657
    self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
    self.send_header("Pragma", "no-cache")
    self.send_header("Expires", "0")
    return super().end_headers()

  def do_OPTIONS(self):
      self.send_response(200, "ok")
      self.end_headers()


  # override the reponse with delay or errors
  def inject(self, response):
    if '_meta_' not in response or 'inject' not in response['_meta_']:
      return response

    for injectType, injectCtx in response['_meta_']['inject'].items():
      injectFunc = getattr(self, f'inject_{injectType}')
      response = injectFunc(injectCtx, response)

    return response


  def inject_delay(self, duration, response):
    if duration.endswith('s'):
      dur = int(duration.rstrip('s'))
    elif duration.endswith('m'):
      dur = int(duration.rstrip('m')) * 60
    elif duration.endswith('h'):
      dur = int(duration.rstrip('h')) * 3600
    else:
      dur = 0
    time.sleep(dur)
    return response


  def inject_ams_error(self, errID, response):
    res = {
      "id": str(errID),
      "kind": "Error",
      "href": f"/api/accounts_mgmt/v1/errors/{errID}",
      "code": f"ACCT-MGMT-{errID}",
      "reason": "Error calling OCM Account Manager",
      "operation_id": "021187a5-5650-41ed-9027-27d6e9ed9075"
    }
    if '_meta_' in response:
      res['_meta_'] = response['_meta_']
    return res


  # a file can contain an array of responses,
  # return the 1st matched response by the specified rules. 
  def match(self, file):
    responses = json.load(file)

    # if the file contains a single response, use it
    if not isinstance(responses, list) or len(responses) == 1:   
      return responses[0] if isinstance(responses, list) else responses

    # get request body if it exists
    self.request_body = {}
    try:
      payloadSize = int(self.headers.get('Content-Length'))
      payload = self.rfile.read(payloadSize)
      self.request_body = json.loads(payload.decode('utf-8'))
    except Exception:
      pass

    # return the 1st matched response
    for res in responses:
      # missing is a match
      if '_meta_' not in res or 'match' not in res['_meta_']:
        return res
      else:
        rules = res['_meta_']['match']
        matchedAllRules = True
        for matchType, matchCtx in rules.items():
          matchFunc = getattr(self, f'match_{matchType}')
          if not matchFunc(matchCtx):
            matchedAllRules = False
            break
        if matchedAllRules:
          return res          
      
    # return the 1st if none matches
    return responses[0]


  def match_request_body(self, expected):
    for key, val in expected.items():
      if key not in self.request_body or self.request_body[key] != val:
        return False
    return True


  def match_method(self, expected):
    return self.command == expected


  def do_POST(self):
    return self.handle_request()


  def do_PUT(self):
    return self.handle_request()


  def do_DELETE(self):
    return self.handle_request()


def main():
    # SimpleHTTPRequestHandler only takes `directory` param from Python 3.7,
    # earlier versions serve current dir.
    os.chdir(os.path.dirname(os.path.realpath(__file__)))
    output_line_buffering()
    try:
        # new in Python 3.7
        Server = http.server.ThreadingHTTPServer
    except AttributeError:
        Server = http.server.HTTPServer

    class ServerV6(Server):
      # Handles both IPv4 & IPv6 localhost with '::' - https://stackoverflow.com/a/32621449
      address_family = socket.AF_INET6

    httpd = ServerV6(('::', 8010), Handler)
    print("Listening on http://localhost:8010")
    httpd.serve_forever()

if __name__ == '__main__':
  main()
