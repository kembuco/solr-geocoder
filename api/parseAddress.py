import usaddress;
import json;
import sys;

print(json.dumps(usaddress.tag(sys.argv[1])[0]))